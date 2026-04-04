const { serviceClient } = require('../config/supabase');
const { sendEmail } = require('../services/emailService');
const logger = require('../utils/logger');

const joinWaitlist = async (req, res, next) => {
  try {
    const {
      email,
      name = '',
      path = '',        // 'starting' | 'existing'
      business_type = '',
      source = '',
    } = req.body;

    // Save to Supabase — non-fatal
    try {
      const { error: dbError } = await serviceClient
        .from('waitlist')
        .insert({ email, name, path, business_type, source });
      if (dbError && dbError.code !== '23505') {
        // 23505 = unique violation (already on waitlist) — not an error worth logging loudly
        logger.error('waitlist insert failed', { error: dbError.message });
      }
    } catch (dbErr) {
      logger.error('waitlist insert threw', { error: dbErr.message });
    }

    // Notify team
    try {
      await sendEmail(
        'enquiry@vpayit.co.uk',
        `New waitlist signup — ${email}`,
        `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#111;padding:24px 32px;border-radius:12px 12px 0 0">
            <span style="color:#fff;font-size:20px;font-weight:700">helm.</span>
            <span style="color:#666;font-size:13px;margin-left:10px">New waitlist signup</span>
          </div>
          <div style="background:#fff;padding:28px 32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
            <table style="width:100%;font-size:14px;border-collapse:collapse">
              <tr><td style="padding:8px 0;color:#6b7280;width:160px">Email</td><td style="padding:8px 0;font-weight:600"><a href="mailto:${email}" style="color:#2563eb">${email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;border-top:1px solid #f1f5f9">Name</td><td style="padding:8px 0;font-weight:600;border-top:1px solid #f1f5f9">${name || '—'}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;border-top:1px solid #f1f5f9">Journey</td><td style="padding:8px 0;font-weight:600;border-top:1px solid #f1f5f9">${path === 'starting' ? 'Starting a business' : path === 'existing' ? 'Already has a company' : '—'}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;border-top:1px solid #f1f5f9">Business type</td><td style="padding:8px 0;font-weight:600;border-top:1px solid #f1f5f9">${business_type || '—'}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;border-top:1px solid #f1f5f9">Source</td><td style="padding:8px 0;font-weight:600;border-top:1px solid #f1f5f9">${source || '—'}</td></tr>
            </table>
          </div>
        </div>`
      );
    } catch (emailErr) {
      logger.error('waitlist team notification failed', { error: emailErr.message });
    }

    // Confirmation to the person
    const firstName = name ? name.split(' ')[0] : 'there';
    try {
      await sendEmail(
        email,
        `You're on the Helm waitlist, ${firstName}`,
        `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#111;padding:28px 32px;border-radius:12px 12px 0 0">
            <span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px">helm<span style="color:#2563eb">.</span></span>
            <span style="color:#555;font-size:13px;margin-left:10px">AI Chief of Staff for UK businesses</span>
          </div>
          <div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
            <h1 style="margin:0 0 8px;font-size:22px;color:#0f172a">You're on the list, ${firstName}</h1>
            <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 24px">
              We're building something that will change how UK small businesses handle compliance, tax, and daily operations. You'll be among the first to get access.
            </p>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px 24px;margin-bottom:24px">
              <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:0.06em">What Helm does for you</p>
              <p style="margin:4px 0;font-size:14px;color:#475569">✓ Company formation (same-day, multi-director)</p>
              <p style="margin:4px 0;font-size:14px;color:#475569">✓ AI that answers any UK tax or compliance question</p>
              <p style="margin:4px 0;font-size:14px;color:#475569">✓ Auto-bookkeeping from your bank feed</p>
              <p style="margin:4px 0;font-size:14px;color:#475569">✓ VAT, Corporation Tax &amp; payroll — all automated</p>
              <p style="margin:4px 0;font-size:14px;color:#475569">✓ Never miss a Companies House or HMRC deadline</p>
            </div>
            <p style="margin:0;font-size:13px;color:#94a3b8">
              Questions? Just reply to this email. We read every one.
            </p>
          </div>
          <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 32px;text-align:center;border-radius:0 0 12px 12px">
            <p style="margin:0;font-size:12px;color:#94a3b8">© 2026 Helm Ltd · London, UK</p>
          </div>
        </div>`
      );
    } catch (emailErr) {
      logger.error('waitlist confirmation email failed', { error: emailErr.message });
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

module.exports = { joinWaitlist };
