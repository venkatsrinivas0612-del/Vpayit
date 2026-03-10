const { detectRecurringBills } = require('../services/billClassifier');

const getBills = async (req, res, next) => {
  try {
    const { status = 'active', category } = req.query;

    let query = req.supabase
      .from('bills')
      .select('*, supplier:suppliers(id, name, category, logo_url, avg_monthly_rate)')
      .eq('user_id', req.user.id)
      .order('next_due_date', { ascending: true });

    if (status)   query = query.eq('status', status);
    if (category) query = query.eq('category', category);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ data });
  } catch (err) { next(err); }
};

const detectBills = async (req, res, next) => {
  try {
    const { data: txns, error: txnErr } = await req.supabase
      .from('transactions')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('is_bill', true)
      .order('date', { ascending: true });

    if (txnErr) throw txnErr;

    const recurring = detectRecurringBills(txns);
    const created   = [];

    for (const bill of recurring) {
      // ── Deduplication: find any existing active bill for this supplier/category ──
      let existingId = null;

      if (bill.supplierId) {
        // Known supplier → match on supplier_id (most precise)
        const { data: existing } = await req.supabase
          .from('bills')
          .select('id')
          .eq('user_id', req.user.id)
          .eq('supplier_id', bill.supplierId)
          .eq('status', 'active')
          .maybeSingle();
        existingId = existing?.id ?? null;
      } else {
        // No matched supplier → fall back to category + null supplier_id
        const { data: existing } = await req.supabase
          .from('bills')
          .select('id')
          .eq('user_id', req.user.id)
          .eq('category', bill.category)
          .is('supplier_id', null)
          .eq('status', 'active')
          .maybeSingle();
        existingId = existing?.id ?? null;
      }

      if (existingId) {
        // Update in place — never create a duplicate
        await req.supabase
          .from('bills')
          .update({
            current_amount:  bill.currentAmount,
            previous_amount: bill.previousAmount,
            next_due_date:   bill.nextDueDate,
            frequency:       bill.frequency,
          })
          .eq('id', existingId);
        continue;
      }

      const { data, error } = await req.supabase
        .from('bills')
        .insert({
          user_id:         req.user.id,
          supplier_id:     bill.supplierId,
          category:        bill.category,
          current_amount:  bill.currentAmount,
          previous_amount: bill.previousAmount,
          frequency:       bill.frequency,
          next_due_date:   bill.nextDueDate,
          status:          'active',
        })
        .select()
        .single();

      if (!error && data) created.push(data);
    }

    res.json({ data: { detected: recurring.length, created: created.length, bills: created } });
  } catch (err) { next(err); }
};

const getBill = async (req, res, next) => {
  try {
    const { data, error } = await req.supabase
      .from('bills')
      .select('*, supplier:suppliers(*), savings:savings_opportunities(*)')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Bill not found' });
    res.json({ data });
  } catch (err) { next(err); }
};

const updateBill = async (req, res, next) => {
  try {
    const allowed = ['status', 'renewal_date', 'next_due_date', 'frequency'];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );

    const { data, error } = await req.supabase
      .from('bills')
      .update(updates)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ data });
  } catch (err) { next(err); }
};

const getBillHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: bill, error: billErr } = await req.supabase
      .from('bills')
      .select('*, supplier:suppliers(name)')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (billErr || !bill) return res.status(404).json({ error: 'Bill not found' });

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    let q = req.supabase
      .from('transactions')
      .select('date, amount, description, supplier_id')
      .eq('user_id', req.user.id)
      .eq('is_bill', true)
      .gte('date', twelveMonthsAgo.toISOString().slice(0, 10))
      .order('date', { ascending: true });

    if (bill.supplier_id) {
      q = q.eq('supplier_id', bill.supplier_id);
    } else {
      q = q.eq('bill_category', bill.category).is('supplier_id', null);
    }

    const { data: txns, error: txnErr } = await q;
    if (txnErr) throw txnErr;

    // Group by month
    const byMonth = {};
    for (const txn of txns ?? []) {
      const key = txn.date.slice(0, 7);
      if (!byMonth[key]) byMonth[key] = 0;
      byMonth[key] += Math.abs(txn.amount ?? 0);
    }

    const months = Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, amount], i, arr) => {
        const prev       = i > 0 ? arr[i - 1][1] : null;
        const changeAmt  = prev !== null ? amount - prev : null;
        const changePct  = prev !== null && prev > 0 ? ((amount - prev) / prev) * 100 : null;
        return {
          month:        key,
          label:        new Date(key + '-01').toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
          amount:       parseFloat(amount.toFixed(2)),
          changeAmount: changeAmt  !== null ? parseFloat(changeAmt.toFixed(2)) : null,
          changePct:    changePct  !== null ? parseFloat(changePct.toFixed(1))  : null,
        };
      });

    // Trend over last 6 months
    const last6    = months.slice(-6);
    let trend      = 'stable';
    let trendPct   = 0;
    if (last6.length >= 2) {
      const first = last6[0].amount;
      const last  = last6[last6.length - 1].amount;
      if (first > 0) {
        trendPct = ((last - first) / first) * 100;
        if (trendPct >  3) trend = 'up';
        if (trendPct < -3) trend = 'down';
      }
    }

    res.json({
      data: {
        months,
        trend,
        trendPct: parseFloat(trendPct.toFixed(1)),
        supplier: bill.supplier?.name || bill.category,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getBills, detectBills, getBill, updateBill, getBillHistory };
