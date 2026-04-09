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

// ── Brief welcome email ───────────────────────────────────────────────────────

function briefWelcomeEmail(subscriber) {
  const { name, business_stage, company_name, industry, outstanding_invoices,
          vat_registered, year_end_month, direct_reports, growth_strategy,
          primary_kpi, biggest_decision, employee_count, has_accountant,
          business_structure, employment_status, plan_to_hire } = subscriber;

  const firstName = (name || 'there').split(' ')[0];

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const accentColour = business_stage === 'aspiring' ? '#7C3AED'
    : business_stage === 'executive' ? '#0D9488'
    : '#2563EB';

  const stageLabel = business_stage === 'aspiring' ? 'Pre-Formation'
    : business_stage === 'executive' ? 'Executive'
    : 'Growth';

  // Build segment-specific bullet points
  const bullets = [];

  if (business_stage === 'aspiring') {
    bullets.push(`UK business structure recommendation for your ${industry || 'industry'}`);
    if (business_structure && business_structure !== 'Not sure yet') bullets.push(`${business_structure} formation walkthrough — step by step`);
    bullets.push('Companies House & HMRC registration checklist');
    if (plan_to_hire && plan_to_hire !== 'Just me for now') bullets.push('RTI/PAYE setup guide — triggered by your hiring plans');
    bullets.push('Your personalised launch roadmap for the next 90 days');
  } else if (business_stage === 'growth') {
    if (vat_registered) {
      bullets.push('Your exact VAT return deadline — calculated from your last filing');
    }
    if (year_end_month) {
      bullets.push(`Corporation Tax deadline: 9 months after your ${MONTHS[year_end_month - 1]} year-end`);
    }
    if (outstanding_invoices && outstanding_invoices !== 'Nothing outstanding') {
      bullets.push(`Invoice tracking for your ${outstanding_invoices} outstanding — chase drafts ready`);
    }
    if (has_accountant && has_accountant.startsWith('Yes')) {
      bullets.push('Strategic decisions to raise with your accountant this week');
    } else {
      bullets.push('Full compliance detail — since you\'re managing it yourself');
    }
    if (employee_count && employee_count !== 'Just me') {
      bullets.push('PAYE/RTI filing calendar for your team');
    }
  } else if (business_stage === 'executive') {
    bullets.push('Executive summary — no noise, only what moves your business');
    if (primary_kpi) bullets.push(`Opens with your primary metric: ${primary_kpi}`);
    if (growth_strategy) bullets.push(`${growth_strategy} lens applied throughout`);
    if (biggest_decision) bullets.push(`Intelligence and risk flags for your upcoming decision`);
    bullets.push('Sector-specific regulatory changes relevant to your role');
  }

  const bulletRows = bullets.map(b => `
    <tr>
      <td style="padding:7px 0;font-size:14px;color:#e2e8f0;line-height:1.5;">
        <span style="color:${accentColour};margin-right:10px;font-size:16px;">✓</span>${b}
      </td>
    </tr>`).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#111111;padding:28px 36px;border-bottom:1px solid rgba(255,255,255,0.06);">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.5px;">Vpayit</span>
                  <span style="color:${accentColour};font-size:11px;font-weight:700;margin-left:8px;background:rgba(37,99,235,0.15);border:1px solid rgba(37,99,235,0.25);padding:2px 8px;border-radius:99px;">AI</span>
                </td>
                <td style="text-align:right;">
                  <span style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.3);background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);padding:3px 10px;border-radius:99px;">${stageLabel}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#111111;padding:36px 36px 0;">
            <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.08em;">Welcome to your morning brief</p>
            <h1 style="margin:0 0 16px;font-size:28px;font-weight:800;color:#ffffff;line-height:1.2;letter-spacing:-0.5px;">
              You're in, ${firstName}.
            </h1>
            <p style="margin:0 0 28px;font-size:15px;color:rgba(255,255,255,0.5);line-height:1.7;">
              Your first brief arrives <strong style="color:#ffffff;">tomorrow at 8am</strong> — built specifically for your stage, industry, and answers. Not a template. Not generic advice.
            </p>
          </td>
        </tr>

        <!-- What's in your brief -->
        <tr>
          <td style="background:#111111;padding:0 36px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:20px 24px;">
              <tr>
                <td>
                  <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.1em;">What your brief will cover</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    ${bulletRows}
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Whitelist notice -->
        <tr>
          <td style="background:#111111;padding:0 36px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(37,99,235,0.08);border:1px solid rgba(37,99,235,0.2);border-radius:10px;padding:16px 20px;">
              <tr>
                <td>
                  <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.6;">
                    <strong style="color:#93c5fd;">One thing to do now:</strong> Add <strong style="color:#ffffff;">hello@vpayit.co.uk</strong> to your contacts. This ensures your brief always arrives in your inbox — not spam.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0d0d0d;border-top:1px solid rgba(255,255,255,0.06);padding:20px 36px;text-align:center;">
            <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.2);">
              © ${new Date().getFullYear()} Vpayit Ltd · Your AI Chief of Staff ·
              <a href="https://app.vpayit.co.uk" style="color:rgba(255,255,255,0.3);text-decoration:none;">app.vpayit.co.uk</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return html;
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

module.exports = { sendEmail, welcomeEmail, billReminderEmail, monthlySummaryEmail, briefWelcomeEmail };
