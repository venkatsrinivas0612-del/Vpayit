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

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

module.exports = { submitQuote };
