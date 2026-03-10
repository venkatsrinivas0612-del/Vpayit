/**
 * Contact form submissions controller.
 * Public endpoint — no auth required.
 * Uses serviceClient to insert into contact_submissions table.
 *
 * Required Supabase table (run in SQL editor):
 *   CREATE TABLE contact_submissions (
 *     id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *     name       text NOT NULL,
 *     email      text NOT NULL,
 *     company    text,
 *     message    text NOT NULL,
 *     created_at timestamptz DEFAULT now()
 *   );
 */
const { serviceClient } = require('../config/supabase');

const submitContact = async (req, res, next) => {
  try {
    const { name, email, company = '', message } = req.body ?? {};

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email, and message are required' });
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const { error } = await serviceClient
      .from('contact_submissions')
      .insert({ name: name.trim(), email: email.trim().toLowerCase(), company: company.trim(), message: message.trim() });

    if (error) throw error;

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

module.exports = { submitContact };
