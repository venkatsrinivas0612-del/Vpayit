import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Building2, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">Vpayit</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
          <p className="text-slate-500 text-sm mb-6">Sign in to your business account</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={set('email')}
                placeholder="you@company.co.uk"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={set('password')}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex justify-end mt-1">
                <Link
                  to="/auth/forgot-password"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/auth/register" className="text-blue-600 font-medium hover:underline">
              Create account
            </Link>
          </p>
        </div>

        {/* Demo access */}
        <div className="mt-4 bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-blue-300" />
            <p className="text-sm font-semibold text-white">Want to explore first?</p>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Try the live demo with pre-loaded UK business data.
          </p>
          <button
            onClick={handleDemo}
            disabled={demoLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-blue-400/50 bg-blue-600/20 hover:bg-blue-600/40 text-blue-200 hover:text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {demoLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {demoLoading ? 'Loading demo…' : 'View live demo'}
          </button>
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          FCA-regulated Open Banking · TrueLayer · Supabase
        </p>
      </div>
    </div>
  );
}
