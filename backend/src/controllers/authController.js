const upsertProfile = async (req, res, next) => {
  try {
    const { business_name, business_type, postcode } = req.body;
    const { id: userId, email } = req.user;

    const { data, error } = await req.supabase
      .from('users')
      .upsert({ id: userId, email, business_name, business_type, postcode }, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ data });
  } catch (err) { next(err); }
};

const getProfile = async (req, res, next) => {
  try {
    const { data, error } = await req.supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .maybeSingle();   // maybeSingle avoids error when no profile row exists yet

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
