import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DEMO_EMAIL    = 'demo@vpayit.co.uk';
const DEMO_PASSWORD = 'demo123';

export default function Login() {
  const { signIn } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from       = location.state?.from?.pathname || '/dashboard';

  const [form, setForm]         = useState({ email: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  useEffect(() => { document.title = 'Sign in | Vpayit'; }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Sign-in failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDemo() {
    setError('');
    setDemoLoading(true);
    try {
      await signIn(DEMO_EMAIL, DEMO_PASSWORD);
      navigate('/dashboard', { replace: true });
    } catch {
      setError('Demo account unavailable — please try again shortly.');
    } finally {
      setDemoLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: '#060c1a' }}
    >
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse 70% 50% at 30% -10%, rgba(99,102,241,0.18), transparent),
          radial-gradient(ellipse 50% 40% at 80% 90%, rgba(139,92,246,0.1), transparent)
        `
      }} />

      <div className="w-full max-w-md relative" style={{ animation: 'fade-up 0.5s ease forwards' }}>
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 24px rgba(99,102,241,0.5)' }}
          >
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">Vpayit</span>
        </div>

        {/* Card */}
        <div className="glass p-8" style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 24px 64px rgba(0,0,0,0.5)' }}>
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-sm mb-6" style={{ color: 'rgba(100,116,139,0.9)' }}>Sign in to your business account</p>

          {error && (
            <div
              className="mb-4 p-3 rounded-xl text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(148,163,184,0.9)' }}>
                Email address
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={set('email')}
                placeholder="you@company.co.uk"
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all"
                style={{
                  background:   'rgba(255,255,255,0.04)',
                  border:       '1px solid rgba(255,255,255,0.08)',
                  caretColor:   '#818cf8',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(148,163,184,0.9)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={set('password')}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all pr-10"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border:     '1px solid rgba(255,255,255,0.08)',
                    caretColor: '#818cf8',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                  onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition-colors"
                  style={{ color: 'rgba(100,116,139,0.7)' }}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex justify-end mt-1.5">
                <Link to="/auth/forgot-password" className="text-xs transition-colors" style={{ color: '#818cf8' }}>
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60 cursor-pointer transition-all btn-glow"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'rgba(100,116,139,0.8)' }}>
            Don't have an account?{' '}
            <Link to="/auth/register" className="font-medium transition-colors" style={{ color: '#818cf8' }}>
              Create account
            </Link>
          </p>
        </div>

        {/* Demo access */}
        <div
          className="mt-4 p-5 text-center rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border:     '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles className="w-4 h-4" style={{ color: '#818cf8' }} />
            <p className="text-sm font-semibold text-white">Want to explore first?</p>
          </div>
          <p className="text-xs mb-3" style={{ color: 'rgba(100,116,139,0.8)' }}>
            Try the live demo with pre-loaded UK business data.
          </p>
          <button
            onClick={handleDemo}
            disabled={demoLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer"
            style={{
              background: 'rgba(99,102,241,0.12)',
              border:     '1px solid rgba(99,102,241,0.25)',
              color:      '#818cf8',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.22)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.12)'; e.currentTarget.style.color = '#818cf8'; }}
          >
            {demoLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {demoLoading ? 'Loading demo…' : '▶  View live demo'}
          </button>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: 'rgba(71,85,105,0.7)' }}>
          FCA-regulated Open Banking · TrueLayer · Supabase
        </p>
      </div>
    </div>
  );
}
