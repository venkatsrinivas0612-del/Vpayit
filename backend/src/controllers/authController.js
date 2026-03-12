const { sendEmail, welcomeEmail } = require('../services/emailService');

const upsertProfile = async (req, res, next) => {
  try {
    const { business_name, business_type, postcode } = req.body;
    const { id: userId, email } = req.user;

    // Check if this is a first-time profile setup (no business_name set yet)
    const { data: existing } = await req.supabase
      .from('users')
      .select('business_name')
      .eq('id', userId)
      .maybeSingle();

    const isFirstSetup = !existing?.business_name && !!business_name;

    const { data, error } = await req.supabase
      .from('users')
      .upsert({ id: userId, email, business_name, business_type, postcode }, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;

    // Fire-and-forget welcome email on first profile completion
    if (isFirstSetup) {
      sendEmail(email, 'Welcome to Vpayit!', welcomeEmail(business_name)).catch(() => {});
    }

    res.status(200).json({ data });
  } catch (err) { next(err); }
};

const getProfile = async (req, res, next) => {
  try {
    const { data, error } = await req.supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Profile not found' });
    res.json({ data });
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const allowed = ['business_name', 'business_type', 'postcode', 'plan'];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );

    const { data, error } = await req.supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ data });
  } catch (err) { next(err); }
};

module.exports = { upsertProfile, getProfile, updateProfile };
