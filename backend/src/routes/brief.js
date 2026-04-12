const { Router } = require('express');
const { serviceClient } = require('../config/supabase');
const { sendEmail, briefWelcomeEmail } = require('../services/emailService');

const router = Router();

router.post('/subscribe', async (req, res) => {
  const {
    name, email, company_name, business_type, delivery_time,
    business_stage, industry, biggest_challenge,
    // aspiring
    business_structure, employment_status, expected_revenue, plan_to_hire,
    // growth
    vat_registered, last_vat_return, year_end_month, monthly_revenue,
    employee_count, has_accountant, outstanding_invoices, on_making_tax_digital,
    // executive
    direct_reports, growth_strategy, primary_kpi, biggest_decision,
    role, company_size,
  } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  const { data, error } = await serviceClient
    .from('brief_subscribers')
    .insert([{
      name,
      email,
      company_name:          company_name          || 'Pre-formation',
      business_type:         business_type         || 'ltd',
      delivery_time:         delivery_time         || '08:00',
      is_active:             true,
      business_stage:        business_stage        || null,
      industry:              industry              || null,
      biggest_challenge:     biggest_challenge     || null,
      // aspiring
      business_structure:    business_structure    || null,
      employment_status:     employment_status     || null,
      expected_revenue:      expected_revenue      || null,
      plan_to_hire:          plan_to_hire          || null,
      // growth
      vat_registered:        vat_registered        ?? null,
      last_vat_return:       last_vat_return       || null,
      year_end_month:        year_end_month        || null,
      monthly_revenue:       monthly_revenue       || null,
      employee_count:        employee_count        || null,
      has_accountant:        has_accountant        || null,
      outstanding_invoices:  outstanding_invoices  || null,
      on_making_tax_digital: on_making_tax_digital ?? null,
      // executive
      direct_reports:        direct_reports        || null,
      growth_strategy:       growth_strategy       || null,
      primary_kpi:           primary_kpi           || null,
      biggest_decision:      biggest_decision      || null,
      role:                  role                  || null,
      company_size:          company_size          || null,
    }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'This email is already signed up for the morning brief.' });
    }
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }

  // Send welcome email — non-blocking, don't fail the request if email fails
  sendEmail(
    data.email,
    'You\'re in — your morning brief starts tomorrow at 8am',
    briefWelcomeEmail(data)
  ).catch(() => {});

  return res.status(201).json({ success: true, subscriber: data });
});

// POST /api/v1/brief/save — called by n8n after generating each brief
router.post('/save', async (req, res) => {
  const { email, content, business_stage } = req.body;
  console.log('[Brief Save] received:', { email, contentLength: content?.length, business_stage });
  if (!email || !content) {
    console.log('[Brief Save] missing fields');
    return res.status(400).json({ error: 'email and content are required.' });
  }

  const { error } = await serviceClient
    .from('brief_history')
    .insert([{ subscriber_email: email, content, business_stage: business_stage || null }]);

  if (error) return res.status(500).json({ error: 'Failed to save brief.', detail: error.message });
  return res.status(201).json({ success: true });
});

// GET /api/v1/brief/history?email=... — fetch past briefs for a subscriber
router.get('/history', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'email is required.' });

  const { data, error } = await serviceClient
    .from('brief_history')
    .select('id, content, business_stage, generated_at')
    .eq('subscriber_email', email)
    .order('generated_at', { ascending: false })
    .limit(30);

  if (error) return res.status(500).json({ error: 'Failed to fetch briefs.' });
  return res.json({ briefs: data });
});

module.exports = router;
