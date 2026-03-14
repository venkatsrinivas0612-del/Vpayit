import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const BUSINESS_TYPES = [
  'Sole Trader', 'Limited Company', 'Partnership',
  'LLP', 'CIC', 'Charity', 'Other',
];

export default function Register() {
  const { signUp } = useAuth();
  const navigate   = useNavigate();

  const [form, setForm] = useState({
    email:         '',
    password:      '',
    business_name: '',
    business_type: '',
    postcode:      '',
  });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await signUp(form.email, form.password, {
        business_name: form.business_name,
        business_type: form.business_type,
        postcode:      form.postcode.toUpperCase(),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%', padding: '11px 16px', borderRadius: 10,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#f1f5f9', fontSize: 14, outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  };
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(148,163,184,0.9)', marginBottom: 6 };

  if (success) {
    return (
      <div style={{
        minHeight: '100vh', background: '#060c1a',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}>
        <div style={{
          width: '100%', maxWidth: 440,
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: 40, textAlign: 'center',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 10 }}>Check your email</h2>
          <p style={{ fontSize: 14, color: 'rgba(148,163,184,0.8)', lineHeight: 1.7, marginBottom: 28 }}>
            We sent a confirmation link to <strong style={{ color: '#818cf8' }}>{form.email}</strong>. Click it to activate your account.
          </p>
          <Link
            to="/auth/login"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '12px 24px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none',
              boxShadow: '0 0 24px rgba(99,102,241,0.4)',
            }}
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#060c1a',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient glows */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 60% 50% at 20% 10%, rgba(99,102,241,0.12), transparent),
          radial-gradient(ellipse 50% 40% at 80% 80%, rgba(168,85,247,0.08), transparent)
        `,
      }} />
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99,102,241,0.45)',
          }}>
            <Zap size={20} color="white" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>Vpayit</span>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: 36,
        }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>Create your account</h1>
          <p style={{ fontSize: 14, color: 'rgba(148,163,184,0.7)', marginBottom: 28 }}>
            Manage all your business bills in one place
          </p>

          {error && (
            <div style={{
              marginBottom: 20, padding: '12px 16px',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 10, fontSize: 13, color: '#f87171',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={labelStyle}>Business name <span style={{ color: '#f87171' }}>*</span></label>
              <input
                type="text" required value={form.business_name} onChange={set('business_name')}
                placeholder="Acme Ltd"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Business type</label>
                <select
                  value={form.business_type} onChange={set('business_type')}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                >
                  <option value="">Select…</option>
                  {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Postcode</label>
                <input
                  type="text" value={form.postcode} onChange={set('postcode')}
                  placeholder="EC2A 4NE"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Email address <span style={{ color: '#f87171' }}>*</span></label>
              <input
                type="email" required value={form.email} onChange={set('email')}
                placeholder="you@company.co.uk"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div>
              <label style={labelStyle}>Password <span style={{ color: '#f87171' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'} required value={form.password} onChange={set('password')}
                  placeholder="Min. 8 characters"
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                />
                <button
                  type="button" onClick={() => setShowPwd(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                    color: 'rgba(100,116,139,0.7)',
                  }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '13px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                color: '#fff', fontSize: 14, fontWeight: 600,
                boxShadow: '0 0 24px rgba(99,102,241,0.4)',
                opacity: loading ? 0.7 : 1,
                transition: 'box-shadow 0.2s, transform 0.15s',
                marginTop: 4,
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.boxShadow = '0 0 36px rgba(99,102,241,0.65)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 24px rgba(99,102,241,0.4)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'rgba(148,163,184,0.7)' }}>
            Already have an account?{' '}
            <Link to="/auth/login" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(100,116,139,0.6)', marginTop: 20 }}>
          By creating an account you agree to our{' '}
          <a href="https://vpayit.co.uk/terms.html" style={{ color: '#818cf8', textDecoration: 'none' }}>Terms</a>
          {' '}and{' '}
          <a href="https://vpayit.co.uk/privacy.html" style={{ color: '#818cf8', textDecoration: 'none' }}>Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
