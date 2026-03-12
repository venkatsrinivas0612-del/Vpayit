const { Resend } = require('resend');
const logger = require('../utils/logger');

// Warn but don't crash if key is missing — email simply won't send
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

if (!resend) {
  logger.warn('RESEND_API_KEY not set — email sending is disabled');
}

const FROM_ADDRESS = 'Vpayit <noreply@vpayit.co.uk>';

// ── Shared layout ─────────────────────────────────────────────────────────────

function layout(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#1d4ed8;padding:28px 40px;">
            <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Vpayit</span>
            <span style="color:#93c5fd;font-size:13px;margin-left:10px;">Business bill management</span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            ${bodyHtml}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">
              © ${new Date().getFullYear()} Vpayit Ltd ·
              <a href="https://app.vpayit.co.uk" style="color:#1d4ed8;text-decoration:none;">app.vpayit.co.uk</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Templates ─────────────────────────────────────────────────────────────────

function welcomeEmail(businessName) {
  const name = businessName || 'there';
  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;color:#0f172a;">Welcome to Vpayit, ${name}!</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
      Your account is all set. Here's what you can do next:
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      ${[
        ['🏦', 'Connect your bank', 'Link your business bank account to automatically detect your recurring bills.'],
        ['📋', 'Review your bills', 'See all your subscriptions and direct debits in one place.'],
        ['💰', 'Find savings', 'Vpayit will identify where you can switch and save.'],
      ].map(([icon, heading, text]) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;">
          <table><tr>
            <td style="font-size:22px;padding-right:14px;vertical-align:top;">${icon}</td>
            <td>
              <strong style="color:#0f172a;font-size:14px;">${heading}</strong>
              <p style="margin:4px 0 0;font-size:13px;color:#64748b;line-height:1.5;">${text}</p>
            </td>
          </tr></table>
        </td>
      </tr>`).join('')}
    </table>

    <a href="https://app.vpayit.co.uk/dashboard"
       style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:15px;font-weight:600;
              padding:13px 28px;border-radius:6px;text-decoration:none;">
      Go to your dashboard →
    </a>`;

  return layout('Welcome to Vpayit!', body);
}

function billReminderEmail(bills) {
  const count = bills.length;
  const total = bills.reduce((s, b) => s + (b.current_amount || 0), 0);

  const rows = bills.map(bill => {
    const name    = bill.supplier?.name || bill.category || 'Bill';
    const amount  = `£${(bill.current_amount || 0).toFixed(2)}`;
    const due     = new Date(bill.next_due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const urgency = bill.days_until_due <= 1 ? '#ef4444' : bill.days_until_due <= 3 ? '#f59e0b' : '#22c55e';
    const label   = bill.days_until_due === 0 ? 'Today' : bill.days_until_due === 1 ? 'Tomorrow' : `${bill.days_until_due} days`;

    return `
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:12px 0;font-size:14px;color:#0f172a;font-weight:500;">${name}</td>
      <td style="padding:12px 0;font-size:14px;color:#475569;">${due}</td>
      <td style="padding:12px 0;font-size:14px;color:#0f172a;font-weight:600;">${amount}</td>
      <td style="padding:12px 0;">
        <span style="background:${urgency}20;color:${urgency};font-size:11px;font-weight:600;
                     padding:3px 8px;border-radius:99px;">${label}</span>
      </td>
    </tr>`;
  }).join('');

  const body = `
    <h1 style="margin:0 0 6px;font-size:22px;color:#0f172a;">
      You have ${count} bill${count !== 1 ? 's' : ''} due this week
    </h1>
    <p style="margin:0 0 28px;font-size:15px;color:#475569;">
      Total coming up: <strong style="color:#0f172a;">£${total.toFixed(2)}</strong>
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <thead>
        <tr style="border-bottom:2px solid #e2e8f0;">
          <th style="padding:8px 0;font-size:12px;color:#94a3b8;font-weight:600;text-align:left;">BILL</th>
          <th style="padding:8px 0;font-size:12px;color:#94a3b8;font-weight:600;text-align:left;">DUE DATE</th>
          <th style="padding:8px 0;font-size:12px;color:#94a3b8;font-weight:600;text-align:left;">AMOUNT</th>
          <th style="padding:8px 0;font-size:12px;color:#94a3b8;font-weight:600;text-align:left;">DUE IN</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <a href="https://app.vpayit.co.uk/bills"
       style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:15px;font-weight:600;
              padding:13px 28px;border-radius:6px;text-decoration:none;">
      View all bills →
    </a>`;

  return layout(`${count} bill${count !== 1 ? 's' : ''} due this week`, body);
}

function monthlySummaryEmail(data) {
  const { month, totalSpend, billCount, topBills = [], savingsAvailable = 0 } = data;

  const topRows = topBills.slice(0, 5).map(b => `
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:10px 0;font-size:14px;color:#0f172a;">${b.name}</td>
      <td style="padding:10px 0;font-size:14px;color:#0f172a;font-weight:600;text-align:right;">£${(b.amount || 0).toFixed(2)}</td>
    </tr>`).join('');

  const body = `
    <h1 style="margin:0 0 6px;font-size:22px;color:#0f172a;">Your ${month} spending summary</h1>
    <p style="margin:0 0 28px;font-size:15px;color:#475569;">Here's how your business bills looked last month.</p>

    <!-- Stats row -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        ${[
          ['Total spend', `£${(totalSpend || 0).toFixed(2)}`],
          ['Bills tracked', billCount || 0],
          ['Potential savings', `£${(savingsAvailable || 0).toFixed(2)}/yr`],
        ].map(([label, value]) => `
        <td width="33%" style="text-align:center;padding:20px 12px;background:#f8fafc;border-radius:6px;">
          <div style="font-size:22px;font-weight:700;color:#1d4ed8;">${value}</div>
          <div style="font-size:12px;color:#64748b;margin-top:4px;">${label}</div>
        </td>`).join('<td width="2%"></td>')}
      </tr>
    </table>

    ${topBills.length ? `
    <h2 style="margin:0 0 12px;font-size:16px;color:#0f172a;">Top bills</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tbody>${topRows}</tbody>
    </table>` : ''}

    <a href="https://app.vpayit.co.uk/dashboard"
       style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:15px;font-weight:600;
              padding:13px 28px;border-radius:6px;text-decoration:none;">
      View full report →
    </a>`;

  return layout(`Your ${month} spending summary`, body);
}

// ── Core send function ────────────────────────────────────────────────────────

async function sendEmail(to, subject, html) {
  if (!resend) {
    logger.warn('sendEmail called but Resend is not configured', { to, subject });
    return { ok: false, reason: 'RESEND_API_KEY not set' };
  }

  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject,
    html,
  });

  if (error) {
    logger.error('Resend send failed', { to, subject, error: error.message });
    return { ok: false, reason: error.message };
  }

  logger.info('Email sent', { to, subject, id: data?.id });
  return { ok: true, id: data?.id };
}

module.exports = { sendEmail, welcomeEmail, billReminderEmail, monthlySummaryEmail };
