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

module.exports = { getBills, detectBills, getBill, updateBill };
