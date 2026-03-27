const { serviceClient } = require('../config/supabase');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const submitContact = async (req, res, next) => {
  try {
    const { name, email, company = '', enquiry = 'General enquiry', message } = req.body;

    // 1. Save to Supabase
    const { error: dbError } = await serviceClient
      .from('contact_submissions')
      .insert({ name, email, company, message });
    if (dbError) throw dbError;

    // 2. Send notification email to you
    await resend.emails.send({
      from: 'Vpayit Contact <hello@vpayit.co.uk>',
      to: 'enquiry@vpayit.co.uk',
      replyTo: email,
      subject: `[${enquiry}] New message from ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <h2 style="color:#2563EB">New contact form submission</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:8px 0;color:#6B7280;width:120px">Name</td><td style="padding:8px 0;font-weight:600">${name}</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280">Email</td><td style="padding:8px 0"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#6B7280">Company</td><td style="padding:8px 0">${company || '—'}</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280">Enquiry type</td><td style="padding:8px 0">${enquiry}</td></tr>
          </table>
          <div style="margin-top:16px;padding:16px;background:#f5f5f7;border-radius:8px;font-size:14px;line-height:1.7;white-space:pre-wrap">${message}</div>
          <p style="margin-top:24px;font-size:12px;color:#9CA3AF">Hit reply to respond directly to ${name}.</p>
        </div>
      `
    });

    // 3. Send confirmation email to the person who submitted
    await resend.emails.send({
      from: 'Vpayit <hello@vpayit.co.uk>',
      to: email,
      subject: `We received your message, ${name.split(' ')[0]}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <h2 style="color:#2563EB">Thanks for getting in touch</h2>
          <p style="font-size:15px;color:#374151;line-height:1.7">Hi ${name.split(' ')[0]},</p>
          <p style="font-size:15px;color:#374151;line-height:1.7">We've received your message and will get back to you within one business day.</p>
          <div style="margin:20px 0;padding:16px;background:#f5f5f7;border-radius:8px;font-size:14px;color:#6B7280;line-height:1.7">
            <strong style="color:#1d1d1f">Your message:</strong><br/><br/>
            <span style="white-space:pre-wrap">${message}</span>
          </div>
          <p style="font-size:14px;color:#6B7280">— The Vpayit team</p>
          <hr style="border:none;border-top:1px solid #e8e8ed;margin:24px 0"/>
          <p style="font-size:12px;color:#9CA3AF">Vpayit Ltd · London, UK · <a href="https://vpayit.co.uk" style="color:#2563EB">vpayit.co.uk</a></p>
        </div>
      `
    });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

module.exports = { submitContact };
```

**Step 3** — Save the file (Ctrl+S)

**Step 4** — In PowerShell, run:
```
cd C:\Users\venka\vpayit
git add backend/src/controllers/contactController.js
git commit -m "Contact form: email notifications via Resend"
git push