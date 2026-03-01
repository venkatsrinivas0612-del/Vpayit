const getSavings = async (req, res, next) => {
  try {
    const { data, error } = await req.supabase
      .from('savings_opportunities')
      .select('*, bill:bills(*, supplier:suppliers(id, name, category, logo_url))')
      .eq('user_id', req.user.id)
      .neq('status', 'dismissed')
      .order('annual_saving', { ascending: false });

    if (error) throw error;

    const totalAnnualSaving = data.reduce((sum, o) => sum + (o.annual_saving || 0), 0);
    res.json({ data, meta: { totalAnnualSaving } });
  } catch (err) { next(err); }
};

const generateOpportunities = async (req, res, next) => {
  try {
    const { data: bills, error: billsErr } = await req.supabase
      .from('bills')
      .select('*, supplier:suppliers(*)')
      .eq('user_id', req.user.id)
      .eq('status', 'active');

    if (billsErr) throw billsErr;

    const opportunities = [];

    for (const bill of bills) {
      if (!bill.supplier || !bill.current_amount) continue;

      // Find cheapest alternative in the same category
      const { data: alternatives } = await req.supabase
        .from('suppliers')
        .select('*')
        .eq('category', bill.supplier.category)
        .neq('id', bill.supplier_id)
        .gt('avg_monthly_rate', 0)
        .lt('avg_monthly_rate', bill.current_amount)
        .order('avg_monthly_rate', { ascending: true })
        .limit(1);

      if (!alternatives?.length) continue;

      const alt           = alternatives[0];
      const monthlySaving = bill.current_amount - alt.avg_monthly_rate;
      const annualSaving  = monthlySaving * 12;

      if (annualSaving < 1) continue;

      const { data: opp, error: oppErr } = await req.supabase
        .from('savings_opportunities')
        .upsert({
          bill_id:              bill.id,
          user_id:              req.user.id,
          alternative_supplier: alt.name,
          alternative_cost:     alt.avg_monthly_rate,
          annual_saving:        annualSaving,
          status:               'pending',
        }, { onConflict: 'bill_id' })
        .select()
        .single();

      if (!oppErr && opp) {
        await req.supabase
          .from('bills')
          .update({ savings_available: true })
          .eq('id', bill.id);

        opportunities.push(opp);
      }
    }

    res.json({ data: opportunities, meta: { generated: opportunities.length } });
  } catch (err) { next(err); }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const VALID = ['viewed', 'applied', 'dismissed'];

    if (!VALID.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${VALID.join(', ')}` });
    }

    const { data, error } = await req.supabase
      .from('savings_opportunities')
      .update({ status })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ data });
  } catch (err) { next(err); }
};

module.exports = { getSavings, generateOpportunities, updateStatus };
