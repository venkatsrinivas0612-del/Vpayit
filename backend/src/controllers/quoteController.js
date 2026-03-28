const { serviceClient } = require('../config/supabase');
const { sendEmail } = require('../services/emailService');
const logger = require('../utils/logger');

const submitQuote = async (req, res, next) => {
  try {
    const {
      services = [],
      business_name = '',
      sector = '',
      employees = '',
      postcode = '',
      monthly_spend = '',
      contract_end = '',
      name,
      email,
      phone = '',
    } = req.body;

    const servicesList = Array.isArray(services) ? services.join(', ') : String(services);

    // Save to Supabase — non-fatal
    try {
      const { error: dbError } = await serviceClient
        .from('quote_leads')
        .insert({ services: servicesList, business_name, sector, employees, postcode, monthly_spend, contract_end, name, email, phone });
      if (dbError) logger.error('quote_leads insert failed', { error: dbError.message });
    } catch (dbErr) {
      logger.error('quote_leads insert threw', { error: dbErr.message });
    }

    // Notify team
    await sendEmail(
      'enquiry@vpayit.co.uk',
      `New quote request — ${name} · ${servicesList}`,
      `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1d4ed8;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0;font-size:20px">New Quote Request</h1>
          <p style="color:#93c5fd;margin:4px 0 0;font-size:13px">Someone wants to save money on their business bills</p>
        </div>
        <div style="background:#fff;padding:28px 32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">

          <h3 style="font-size:13px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 16px">Services Requested</h3>
          <p style="font-size:16px;font-weight:700;color:#0f172a;margin:0 0 24px;padding:14px 18px;background:#eff6ff;border-radius:8px;border-left:4px solid #2563eb">${servicesList || 'Not specified'}</p>

          <h3 style="font-size:13px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 16px">Business Details</h3>
          <table style="width:100%;font-size:14px;border-collapse:collapse;margin-bottom:24px">
            <tr><td style="padding:8px 0;color:#6b7280;width:160px">Business name</td><td style="padding:8px 0;font-weight:600;color:#0f172a">${business_name || '—'}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;border-top:1px solid #f1f5f9">Sector</td><td style="padding:8px 0;font-weight:600;color:#0f172a;border-top:1px solid #f1f5f9">${sector || '—'}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;border-top:1px solid #f1f5f9">Employees</td><td style="padding:8px 0;font-weight:600;color:#0f172a;border-top:1px solid #f1f5f9">${employees || '—'}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;border-top:1px solid #f1f5f9">Postcode</td><td style="padding:8px 0;font-weight:600;color:#0f172a;border-top:1px solid #f1f5f9">${postcode || '—'}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;border-top:1px solid #f1f5f9">Monthly spend</td><td style="padding:8px 0;font-weight:600;color:#0f172a;border-top:1px solid #f1f5f9">${monthly_spend || '—'}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;border-top:1px solid #f1f5f9">Contract ends</td><td style="padding:8px 0;font-weight:600;color:#0f172a;border-top:1px solid #f1f5f9">${contract_end || '—'}</td></tr>
          </table>

          <h3 style="font-size:13px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 16px">Contact</h3>
          <table style="width:100%;font-size:14px;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#6b7280;width:160px">Name</td><td style="padding:8px 0;font-weight:600;color:#0f172a">${name}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;border-top:1px solid #f1f5f9">Email</td><td style="padding:8px 0;border-top:1px solid #f1f5f9"><a href="mailto:${email}" style="color:#2563eb;font-weight:600">${email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;border-top:1px solid #f1f5f9">Phone</td><td style="padding:8px 0;font-weight:600;color:#0f172a;border-top:1px solid #f1f5f9">${phone || '—'}</td></tr>
          </table>

          <div style="margin-top:28px;padding:16px 18px;background:#ecfdf5;border-radius:8px;border:1px solid #a7f3d0">
            <p style="margin:0;font-size:13px;color:#065f46;font-weight:600">Action needed: Reply to ${name} at ${email} within 24 hours with comparison options.</p>
          </div>
        </div>
      </div>`
    );

    // Confirmation to the customer
    const firstName = name.split(' ')[0];
    await sendEmail(
      email,
      `We're on it, ${firstName} — your free comparison is underway`,
      `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1d4ed8;padding:28px 32px;border-radius:12px 12px 0 0">
          <span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px">Vpayit</span>
          <span style="color:#93c5fd;font-size:13px;margin-left:10px">Business bill management</span>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          <h1 style="margin:0 0 8px;font-size:22px;color:#0f172a">Thanks ${firstName}, we're comparing your bills now</h1>
          <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 24px">
            We've received your request and our team is working on finding you the best deals. You'll hear from us within <strong>24 hours</strong> with a personalised comparison.
          </p>

          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:20px 24px;margin-bottom:24px">
            <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#1d4ed8;text-transform:uppercase;letter-spacing:0.06em">What we're comparing for you</p>
            <p style="margin:0;font-size:16px;font-weight:600;color:#0f172a">${servicesList || 'Business bills'}</p>
          </div>

          <p style="font-size:14px;color:#64748b;line-height:1.7;margin:0 0 24px">
            While you wait, you can also connect your bank account to let us see your actual spend — it makes the comparison much more accurate and finds bigger savings.
          </p>

          <a href="https://app.vpayit.co.uk/auth/register"
             style="display:inline-block;background:#1d4ed8;color:#fff;font-size:15px;font-weight:600;padding:13px 28px;border-radius:8px;text-decoration:none">
            Connect my bank account →
          </a>

          <p style="margin:28px 0 0;font-size:13px;color:#94a3b8">
            Questions? Just reply to this email — we're a real team, not a bot.
          </p>
        </div>
        <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 32px;text-align:center;border-radius:0 0 12px 12px">
          <p style="margin:0;font-size:12px;color:#94a3b8">
            © ${new Date().getFullYear()} Vpayit Ltd · London, UK ·
            <a href="https://vpayit.co.uk" style="color:#1d4ed8;text-decoration:none">vpayit.co.uk</a>
          </p>
        </div>
      </div>`
    );

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

module.exports = { submitQuote };
