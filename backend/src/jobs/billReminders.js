const { serviceClient } = require('../config/supabase');
const { sendEmail, billReminderEmail } = require('../services/emailService');
const logger = require('../utils/logger');

/**
 * Queries all users with bills due in the next 7 days,
 * groups them by user, and sends one reminder email per user.
 *
 * @returns {{ sent: number, skipped: number, errors: number }}
 */
async function runBillReminders() {
  const today  = new Date();
  today.setHours(0, 0, 0, 0);
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() + 7);

  const todayStr  = today.toISOString().slice(0, 10);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  // Fetch all upcoming bills with user email via the users table
  const { data: bills, error } = await serviceClient
    .from('bills')
    .select('*, supplier:suppliers(id, name), user:users(id, email, business_name)')
    .eq('status', 'active')
    .gte('next_due_date', todayStr)
    .lte('next_due_date', cutoffStr)
    .order('next_due_date', { ascending: true });

  if (error) {
    logger.error('billReminders: failed to fetch bills', { error: error.message });
    throw error;
  }

  if (!bills || bills.length === 0) {
    logger.info('billReminders: no upcoming bills found');
    return { sent: 0, skipped: 0, errors: 0 };
  }

  // Group bills by user id
  const byUser = {};
  for (const bill of bills) {
    const user = bill.user;
    if (!user?.email) continue;
    if (!byUser[user.id]) byUser[user.id] = { user, bills: [] };

    const daysUntilDue = Math.round(
      (new Date(bill.next_due_date) - today) / (1000 * 60 * 60 * 24)
    );
    byUser[user.id].bills.push({ ...bill, days_until_due: daysUntilDue });
  }

  let sent = 0, skipped = 0, errors = 0;

  for (const { user, bills: userBills } of Object.values(byUser)) {
    if (!userBills.length) { skipped++; continue; }

    const subject = `${userBills.length} bill${userBills.length !== 1 ? 's' : ''} due this week — Vpayit`;
    const html    = billReminderEmail(userBills);

    const result = await sendEmail(user.email, subject, html);
    if (result.ok) {
      sent++;
      logger.info('billReminders: sent reminder', { userId: user.id, bills: userBills.length });
    } else {
      errors++;
      logger.error('billReminders: failed to send', { userId: user.id, reason: result.reason });
    }
  }

  return { sent, skipped, errors };
}

module.exports = { runBillReminders };
