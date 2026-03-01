const getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, from, to, category, is_bill } = req.query;
    const pageInt  = Math.max(1, parseInt(page));
    const limitInt = Math.min(200, parseInt(limit));
    const offset   = (pageInt - 1) * limitInt;

    let query = req.supabase
      .from('transactions')
      .select('*, supplier:suppliers(id, name, logo_url)', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('date', { ascending: false })
      .range(offset, offset + limitInt - 1);

    if (from)                  query = query.gte('date', from);
    if (to)                    query = query.lte('date', to);
    if (category)              query = query.eq('category', category);
    if (is_bill !== undefined) query = query.eq('is_bill', is_bill === 'true');

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({
      data,
      meta: {
        total: count,
        page:  pageInt,
        limit: limitInt,
        pages: Math.ceil(count / limitInt),
      },
    });
  } catch (err) { next(err); }
};

const getBillTransactions = async (req, res, next) => {
  try {
    const { data, error } = await req.supabase
      .from('transactions')
      .select('*, supplier:suppliers(id, name, category, logo_url)')
      .eq('user_id', req.user.id)
      .eq('is_bill', true)
      .order('date', { ascending: false })
      .limit(200);

    if (error) throw error;
    res.json({ data });
  } catch (err) { next(err); }
};

const getSummary = async (req, res, next) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const [year, mon] = month.split('-');
    const from = `${year}-${mon}-01`;
    const to   = new Date(Number(year), Number(mon), 0).toISOString().split('T')[0];

    const { data, error } = await req.supabase
      .from('transactions')
      .select('amount, is_bill, bill_category')
      .eq('user_id', req.user.id)
      .gte('date', from)
      .lte('date', to);

    if (error) throw error;

    const debits     = data.filter(t => t.amount < 0);
    const totalSpend = debits.reduce((s, t) => s + Math.abs(t.amount), 0);
    const billSpend  = debits
      .filter(t => t.is_bill)
      .reduce((s, t) => s + Math.abs(t.amount), 0);

    const byCategory = {};
    debits
      .filter(t => t.is_bill && t.bill_category)
      .forEach(t => {
        byCategory[t.bill_category] = (byCategory[t.bill_category] || 0) + Math.abs(t.amount);
      });

    res.json({
      data: {
        month,
        totalSpend,
        billSpend,
        nonBillSpend:     totalSpend - billSpend,
        byCategory,
        transactionCount: data.length,
      },
    });
  } catch (err) { next(err); }
};

module.exports = { getTransactions, getBillTransactions, getSummary };
