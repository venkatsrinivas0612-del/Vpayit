import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CheckCircle, Loader2 } from 'lucide-react';

const BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

async function sendContactForm(body) {
  const res = await fetch(`${BASE}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
}

const TEAM = [
  {
    name: 'Venkat Srinivas',
    role: 'Founder & CEO',
    bio: 'Passionate about fintech and building tools that help UK businesses thrive.',
  },
  {
    name: 'Vpayit Team',
    role: 'Engineering & Product',
    bio: 'A small, focused team obsessed with making bill management effortless.',
  },
];

const VALUES = [
  {
    title: 'Transparency',
    desc: 'We never charge hidden fees. Our pricing is public and our data practices are clear.',
  },
  {
    title: 'Security',
    desc: 'FCA-regulated Open Banking via TrueLayer. We never see or store your bank credentials.',
  },
  {
    title: 'UK-first',
    desc: 'Built specifically for UK SMEs, with GBP-native reporting and UK supplier benchmarks.',
  },
];

export default function About() {
  useEffect(() => { document.title = 'About | Vpayit'; }, []);

  const [form, setForm]     = useState({ name: '', email: '', company: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errMsg, setErrMsg] = useState('');

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setErrMsg('');
    try {
      await sendContactForm(form);
      setStatus('success');
      setForm({ name: '', email: '', company: '', message: '' });
    } catch {
      setStatus('error');
      setErrMsg('Something went wrong. Please try again or email us directly at hello@vpayit.co.uk');
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 h-16 border-b border-slate-100">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-900">Vpayit</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/pricing" className="text-sm font-medium text-slate-500 hover:text-blue-600 px-3 py-2 transition-colors">
            Pricing
          </Link>
          <Link to="/auth/login" className="text-sm font-medium text-slate-500 hover:text-blue-600 px-3 py-2 transition-colors">
            Log in
          </Link>
          <Link
            to="/auth/register"
            className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pt-20 pb-24">

        {/* Story */}
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-6">About Vpayit</h1>
        <p className="text-lg text-slate-500 leading-relaxed mb-5">
          Vpayit was founded with one simple mission: help UK small businesses stop overpaying on their bills.
          The average SME wastes over <span className="font-semibold text-slate-700">£1,900 per year</span> on
          bills they could switch or renegotiate — but most business owners don't have the time to track every
          direct debit and standing order.
        </p>
        <p className="text-lg text-slate-500 leading-relaxed mb-14">
          We built Vpayit to solve that. Connect your business bank account via FCA-regulated Open Banking,
          and we automatically detect every recurring bill, flag price rises, and show you exactly where you
          can save — all in one clean dashboard.
        </p>

        {/* Values */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-16">
          {VALUES.map(({ title, desc }) => (
            <div key={title} className="bg-slate-50 rounded-xl p-6 border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Team */}
        <h2 className="text-2xl font-bold text-slate-900 mb-5">The team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-16">
          {TEAM.map(({ name, role, bio }) => (
            <div key={name} className="flex items-start gap-4 p-5 border border-slate-200 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <span className="text-blue-700 font-bold text-lg">{name[0]}</span>
              </div>
              <div>
                <p className="font-semibold text-slate-900">{name}</p>
                <p className="text-xs text-blue-600 font-medium mb-1">{role}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{bio}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact form */}
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Get in touch</h2>
        <p className="text-slate-500 text-sm mb-8">
          Have a question, partnership enquiry, or just want to say hello? We'd love to hear from you.
        </p>

        {status === 'success' ? (
          <div className="flex items-start gap-3 p-5 bg-green-50 border border-green-200 rounded-xl text-green-700">
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Message sent!</p>
              <p className="text-sm text-green-600 mt-0.5">We'll get back to you within 1 business day.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={e => setField('name', e.target.value)}
                  placeholder="Your name"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={e => setField('email', e.target.value)}
                  placeholder="you@company.com"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
              <input
                type="text"
                value={form.company}
                onChange={e => setField('company', e.target.value)}
                placeholder="Your company name"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Message *</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={e => setField('message', e.target.value)}
                placeholder="Tell us how we can help…"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            {status === 'error' && (
              <p className="text-sm text-red-600">{errMsg}</p>
            )}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors disabled:opacity-60"
            >
              {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
              {status === 'loading' ? 'Sending…' : 'Send message'}
            </button>
          </form>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Vpayit Ltd ·{' '}
        <a href="https://vpayit.co.uk" className="hover:text-blue-600">vpayit.co.uk</a>
      </div>
    </div>
  );
}
