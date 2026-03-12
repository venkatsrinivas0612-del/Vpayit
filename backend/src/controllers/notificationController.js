const { runBillReminders } = require('../jobs/billReminders');
const logger = require('../utils/logger');

const getBillReminders = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() + 7);

    const { data: bills, error } = await req.supabase
      .from('bills')
      .select('*, supplier:suppliers(id, name, logo_url)')
      .eq('user_id', req.user.id)
      .eq('status', 'active')
      .gte('next_due_date', today.toISOString().slice(0, 10))
      .lte('next_due_date', cutoff.toISOString().slice(0, 10))
      .order('next_due_date', { ascending: true });

    if (error) throw error;

    const notifications = (bills || []).map(bill => {
      const dueDate = new Date(bill.next_due_date);
      dueDate.setHours(0, 0, 0, 0);
      const diff = Math.round((dueDate - today) / (1000 * 60 * 60 * 24));

      const name   = bill.supplier?.name || bill.category || 'Bill';
      const amount = (bill.current_amount ?? 0).toFixed(2);

      let message;
      if (diff === 0)      message = `${name} (£${amount}) is due today`;
      else if (diff === 1) message = `${name} (£${amount}) is due tomorrow`;
      else                 message = `${name} (£${amount}) is due in ${diff} days`;

      return {
        bill_id:        bill.id,
        supplier_name:  name,
        amount:         bill.current_amount,
        due_date:       bill.next_due_date,
        days_until_due: diff,
        urgency:        diff <= 1 ? 'urgent' : diff <= 3 ? 'warning' : 'info',
        message,
      };
    });

    res.json({ upcoming: notifications, count: notifications.length });
  } catch (err) {
    next(err);
  }
};

const sendReminders = async (req, res, next) => {
  try {
    logger.info('sendReminders: job triggered via admin endpoint');
    const result = await runBillReminders();
    res.json({ ok: true, ...result });
  } catch (err) {
    next(err);
  }
};

module.exports = { getBillReminders, sendReminders };
