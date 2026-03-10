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
    const { name, email, company = '', message } = req.body;

    const { error } = await serviceClient
      .from('contact_submissions')
      .insert({ name, email, company, message });

    if (error) throw error;

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

module.exports = { submitContact };
