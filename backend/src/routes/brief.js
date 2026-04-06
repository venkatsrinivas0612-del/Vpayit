const { Router } = require('express');
const { serviceClient } = require('../config/supabase');

const router = Router();

// POST /api/v1/brief/subscribe
// Saves a new morning brief subscriber to Supabase
router.post('/subscribe', async (req, res) => {
  const { name, email, company_name, business_type, delivery_time } = req.body;

  if (!name || !email || !company_name || !business_type) {
    return res.status(400).json({ error: 'Name, email, company name, and business type are required.' });
  }

  const { data, error } = await serviceClient
    .from('brief_subscribers')
    .insert([{
      name,
      email,
      company_name,
      business_type,
      delivery_time: delivery_time || '08:00',
      is_active: true,
    }])
    .select()
    .single();

  if (error) {
    // Duplicate email
    if (error.code === '23505') {
      return res.status(409).json({ error: 'This email is already signed up for the morning brief.' });
    }
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }

  return res.status(201).json({ success: true, subscriber: data });
});

module.exports = router;
