import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CheckCircle, Loader2, X, Mail, MapPin } from 'lucide-react';

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

const PROBLEMS = [
  {
    stat: '4+ hrs',
    title: 'Wasted every month',
    desc: 'UK SMEs spend more than 4 hours per month managing bills manually — logging into supplier portals, chasing invoices, and reconciling payments.',
    num: '01',
  },
  {
    stat: '73%',
    title: 'Overpaying right now',
    desc: '73% of small businesses are overpaying on at least one utility or service. Most don\'t know it because they\'ve never had time to check.',
    num: '02',
  },
  {
    stat: '£1,900',
    title: 'Average annual saving',
    desc: 'The average UK SME can save £1,900 per year simply by switching to better deals that are already available on the market today.',
    num: '03',
  },
  {
    stat: 'Too slow',
    title: 'Switching feels impossible',
    desc: 'Most business owners know they should switch — but the process is time-consuming, confusing, and fragmented across dozens of comparison sites.',
    num: '04',
  },
];

const VALUES = [
  {
    icon: '🔍',
    title: 'Transparency',
    desc: 'No hidden fees, no surprises. You always see exactly what you\'re paying and what you could save. We never take undisclosed commissions or rank suppliers by who pays us most.',
  },
  {
    icon: '🛡️',
    title: 'Security',
    desc: 'Bank-grade encryption, FCA-regulated Open Banking, read-only access. Your bank credentials are never seen or stored by us. Your data is never sold to third parties.',
  },
  {
    icon: '⚡',
    title: 'Simplicity',
    desc: 'Set up in 2 minutes. Vpayit does the hard work so you can focus on running your business. If managing your bills takes more than 5 minutes a month, we haven\'t done our job.',
  },
];

const TEAM = [
  {
    initials: 'VS',
    name: 'Venkat Srinivas',
    role: 'CEO & Founder',
    bio: 'MSc Finance (Banking), University of Westminster. Background in financial services and investment analysis. Passionate about using technology to level the playing field for small businesses.',
    tags: ['Financial Services', 'Investment Analysis', 'Fintech'],
    avatarClass: 'bg-gradient-to-br from-blue-600 to-purple-600',
    placeholder: false,
  },
  {
    initials: '?',
    name: 'Open Role',
    role: 'Chief Technology Officer',
    bio: 'We\'re looking for a CTO to lead engineering. Ideally experienced in fintech, Open Banking, and scaling SaaS products for UK SMEs.',
    tags: ['Hiring Soon'],
    avatarClass: 'bg-slate-300',
    placeholder: true,
  },
  {
    initials: '?',
    name: 'Open Role',
    role: 'Head of Product',
    bio: 'Coming soon — we\'re building a world-class product team. Interested in joining Vpayit? We\'d love to hear from you.',
    tags: ['Coming Soon'],
    avatarClass: 'bg-slate-300',
    placeholder: true,
  },
];

function ContactModal({ onClose }) {
  const [form, setForm]     = useState({ name: '', email: '', company: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [errMsg, setErrMsg] = useState('');

  function setField(key, val) { setForm(f => ({ ...f, [key]: val })); }

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
      setErrMsg('Something went wrong. Please try again or email hello@vpayit.co.uk directly.');
    }
  }

  // Close on backdrop click or ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Get in touch</h3>
            <p className="text-sm text-slate-500 mt-0.5">We'll reply within 1 business day.</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal body */}
        <div className="px-6 py-5">
          {status === 'success' ? (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Message sent!</p>
                <p className="text-sm text-green-600 mt-0.5">We'll get back to you within 1 business day.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  rows={4}
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
                className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors disabled:opacity-60"
              >
                {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
                {status === 'loading' ? 'Sending…' : 'Send message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function About() {
  useEffect(() => { document.title = 'About | Vpayit'; }, []);
  const [showContact, setShowContact] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}

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

      {/* HERO */}
      <div className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,rgba(37,99,235,0.05),transparent)]" />
        <div className="relative max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 text-sm font-semibold text-blue-700 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Our story
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight mb-6">
            Making business bills <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">simple.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Vpayit helps UK small businesses take control of their recurring bills, find better deals, and save thousands every year.
          </p>
        </div>
      </div>

      {/* OUR STORY */}
      <div className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-xs font-bold text-blue-600 tracking-widest uppercase mb-4">Our story</p>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-6">Born from a simple frustration</h2>
              <p className="text-slate-600 leading-relaxed mb-5">
                Founded in 2025, Vpayit was born from a simple frustration — UK small businesses waste hours every month managing bills and overpay by thousands because comparing suppliers is painful. We built Vpayit to fix that.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Using Open Banking technology, Vpayit automatically connects to your business bank account, detects every recurring payment, and compares your costs against 30+ UK suppliers. No spreadsheets, no phone calls, no hassle.
              </p>
            </div>
            {/* Mini dashboard illustration */}
            <div className="space-y-3">
              {[
                { icon: '⚡', name: 'British Gas', sub: 'Energy · Monthly', val: '£342', valColor: 'text-amber-600' },
                { icon: '🏛️', name: 'Business Rates', sub: 'Annual · Hackney Council', val: '£485', valColor: 'text-slate-800' },
                { icon: '🛡️', name: 'Aviva Insurance', sub: 'Renews in 45 days', val: '£156', valColor: 'text-red-600' },
              ].map(row => (
                <div key={row.name} className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl shrink-0">{row.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{row.name}</p>
                    <p className="text-xs text-slate-400">{row.sub}</p>
                  </div>
                  <p className={`text-base font-bold shrink-0 ${row.valColor}`}>{row.val}</p>
                </div>
              ))}
              <div className="flex items-center gap-4 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-xl shrink-0">💰</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">3 savings found</p>
                  <p className="text-xs text-green-600 font-medium">You could save £1,240/year</p>
                </div>
                <p className="text-green-600 font-bold">→</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* THE PROBLEM WE SOLVE */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-bold text-blue-600 tracking-widest uppercase mb-4">The problem we solve</p>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">UK SMEs are leaving money on the table</h2>
          <p className="text-slate-500 max-w-xl mx-auto">The numbers are stark — and the solution has been missing until now.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {PROBLEMS.map((p) => (
            <div key={p.num} className="relative bg-white border border-slate-200 rounded-2xl p-8 overflow-hidden group hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all">
              <span className="absolute top-4 right-5 text-6xl font-black text-slate-50 select-none leading-none group-hover:text-blue-50 transition-colors">
                {p.num}
              </span>
              <p className="text-4xl font-extrabold text-blue-600 tracking-tight mb-2">{p.stat}</p>
              <h3 className="text-base font-bold text-slate-900 mb-2">{p.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* BUSINESS MODEL */}
      <div className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <p className="text-xs font-bold text-blue-600 tracking-widest uppercase mb-4">How we work</p>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">Aligned with your interests</h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-5">
            Vpayit is free for basic use. We earn revenue when we successfully help you switch to a better deal — the new supplier pays us a referral fee. You save money, we earn a commission. Everyone wins.
          </p>
          <p className="text-lg text-slate-600 leading-relaxed mb-10">
            We never charge you to save money. Our interests are aligned with yours.
          </p>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl px-8 py-6 text-left">
            <p className="text-blue-800 leading-relaxed">
              <span className="text-xl mr-2">💡</span>
              <strong>No conflicts of interest.</strong> We only recommend a switch when the saving is genuine. We show you the numbers transparently so you can decide — no pressure, no hidden commissions, no sponsored results.
            </p>
          </div>
        </div>
      </div>

      {/* VISION & MISSION */}
      <div className="bg-slate-900">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-4">Our purpose</p>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Why we exist</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-2xl p-10 relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-white/5 translate-x-8 translate-y-8" />
              <p className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-5">Vision</p>
              <h3 className="text-2xl font-extrabold text-white leading-snug">
                A world where no small business overpays for essential services
              </h3>
            </div>
            <div className="bg-gradient-to-br from-blue-800 to-blue-600 rounded-2xl p-10 relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-white/10 translate-x-8 translate-y-8" />
              <p className="text-xs font-bold text-blue-200/60 tracking-widest uppercase mb-5">Mission</p>
              <h3 className="text-2xl font-extrabold text-white leading-snug">
                To give every UK SME the tools to manage, track, and reduce their business bills — automatically
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* OUR VALUES */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-bold text-blue-600 tracking-widest uppercase mb-4">Our values</p>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">What we stand for</h2>
          <p className="text-slate-500 max-w-lg mx-auto">Three principles guide everything we build and every decision we make.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {VALUES.map(({ icon, title, desc }) => (
            <div key={title} className="bg-white border border-slate-200 rounded-2xl p-8 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all group">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-5 group-hover:bg-blue-100 transition-colors">
                {icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* TEAM */}
      <div className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-blue-600 tracking-widest uppercase mb-4">The team</p>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">People building Vpayit</h2>
            <p className="text-slate-500 max-w-lg mx-auto">A small, focused team with deep experience in financial services and technology.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TEAM.map(({ initials, name, role, bio, tags, avatarClass, placeholder }) => (
              <div
                key={role}
                className={`rounded-2xl p-8 text-center border transition-all ${
                  placeholder
                    ? 'bg-white border-dashed border-slate-300'
                    : 'bg-white border-blue-100 shadow-sm hover:shadow-md'
                }`}
              >
                <div className={`w-16 h-16 rounded-full ${avatarClass} flex items-center justify-center text-2xl font-extrabold text-white mx-auto mb-5`}>
                  {initials}
                </div>
                <p className={`text-lg font-bold mb-1 ${placeholder ? 'text-slate-400' : 'text-slate-900'}`}>{name}</p>
                <p className={`text-sm font-semibold mb-4 ${placeholder ? 'text-slate-400' : 'text-blue-600'}`}>{role}</p>
                <p className={`text-sm leading-relaxed mb-5 ${placeholder ? 'text-slate-400 italic' : 'text-slate-500'}`}>{bio}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        placeholder
                          ? 'bg-slate-100 text-slate-400'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONTACT */}
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="text-xs font-bold text-blue-600 tracking-widest uppercase mb-4">Get in touch</p>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">We'd love to hear from you</h2>
        <p className="text-slate-500 mb-12 max-w-md mx-auto leading-relaxed">
          Whether you have a question, a partnership idea, or just want to say hello — our inbox is always open.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-12">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Email</p>
              <a href="mailto:hello@vpayit.co.uk" className="text-sm font-semibold text-blue-600 hover:underline">
                hello@vpayit.co.uk
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Location</p>
              <p className="text-sm font-semibold text-slate-700">London, UK</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowContact(true)}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-base transition-all hover:shadow-lg hover:shadow-blue-100 hover:-translate-y-0.5"
        >
          Send us a message →
        </button>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Vpayit Ltd ·{' '}
        <a href="https://vpayit.co.uk" className="hover:text-blue-600">vpayit.co.uk</a>
      </div>
    </div>
  );
}
