import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, CheckCircle, Loader2, X, Mail, MapPin, Search, Shield, TrendingDown } from 'lucide-react';

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
  { stat: '4+ hrs',  num: '01', title: 'Wasted every month',        desc: 'UK SMEs spend more than 4 hours per month managing bills manually — logging into supplier portals, chasing invoices, and reconciling payments.' },
  { stat: '73%',     num: '02', title: 'Overpaying right now',       desc: "73% of small businesses are overpaying on at least one utility or service. Most don't know it because they've never had time to check." },
  { stat: '£1,900',  num: '03', title: 'Average annual saving',      desc: 'The average UK SME can save £1,900 per year simply by switching to better deals that are already available on the market today.' },
  { stat: 'Too slow',num: '04', title: 'Switching feels impossible', desc: "Most business owners know they should switch — but the process is time-consuming, confusing, and fragmented across dozens of comparison sites." },
];

const VALUES = [
  { icon: Search,     color: '#818cf8', bg: 'rgba(99,102,241,0.12)',   title: 'Transparency',  desc: "No hidden fees, no surprises. You always see exactly what you're paying and what you could save. We never take undisclosed commissions." },
  { icon: Shield,     color: '#34d399', bg: 'rgba(16,185,129,0.12)',   title: 'Security',      desc: "Bank-grade encryption, FCA-regulated Open Banking, read-only access. Your bank credentials are never seen or stored by us." },
  { icon: Zap,        color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',   title: 'Simplicity',    desc: "Set up in 2 minutes. Vpayit does the hard work so you can focus on running your business. Managing bills should take under 5 minutes a month." },
];

const TEAM = [
  {
    initials: 'VS', name: 'Venkat Srinivas', role: 'CEO & Founder', placeholder: false,
    bio: 'MSc Finance (Banking), University of Westminster. Background in financial services and investment analysis. Passionate about using technology to level the playing field for small businesses.',
    tags: ['Financial Services', 'Investment Analysis', 'Fintech'],
    gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
  },
  {
    initials: '?', name: 'Open Role', role: 'Chief Technology Officer', placeholder: true,
    bio: "We're looking for a CTO to lead engineering. Ideally experienced in fintech, Open Banking, and scaling SaaS products for UK SMEs.",
    tags: ['Hiring Soon'],
    gradient: 'rgba(255,255,255,0.08)',
  },
  {
    initials: '?', name: 'Open Role', role: 'Head of Product', placeholder: true,
    bio: "Coming soon — we're building a world-class product team. Interested in joining Vpayit? We'd love to hear from you.",
    tags: ['Coming Soon'],
    gradient: 'rgba(255,255,255,0.08)',
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

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#f1f5f9', fontSize: 14, outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box',
  };
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(148,163,184,0.8)', marginBottom: 5 };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: '100%', maxWidth: 480,
        background: 'rgba(15,15,35,0.98)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20,
        boxShadow: '0 0 80px rgba(99,102,241,0.2)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 2 }}>Get in touch</h3>
            <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.7)' }}>We'll reply within 1 business day.</p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(148,163,184,0.7)',
            }}
          >
            <X size={14} />
          </button>
        </div>

        <div style={{ padding: '20px 24px 24px' }}>
          {status === 'success' ? (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16,
              background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: 12,
            }}>
              <CheckCircle size={18} color="#34d399" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#34d399', marginBottom: 3 }}>Message sent!</p>
                <p style={{ fontSize: 13, color: 'rgba(52,211,153,0.7)' }}>We'll get back to you within 1 business day.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Name *</label>
                  <input required type="text" value={form.name} onChange={e => setField('name', e.target.value)} placeholder="Your name" style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input required type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="you@company.com" style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Company</label>
                <input type="text" value={form.company} onChange={e => setField('company', e.target.value)} placeholder="Your company name" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Message *</label>
                <textarea required rows={4} value={form.message} onChange={e => setField('message', e.target.value)} placeholder="Tell us how we can help…"
                  style={{ ...inputStyle, resize: 'none' }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              {status === 'error' && (
                <p style={{ fontSize: 13, color: '#f87171' }}>{errMsg}</p>
              )}
              <button
                type="submit" disabled={status === 'loading'}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '11px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  color: '#fff', fontSize: 14, fontWeight: 600,
                  boxShadow: '0 0 20px rgba(99,102,241,0.35)',
                  opacity: status === 'loading' ? 0.7 : 1,
                }}
              >
                {status === 'loading' && <Loader2 size={14} className="animate-spin" />}
                {status === 'loading' ? 'Sending…' : 'Send message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const sectionLabel = { fontSize: 11, fontWeight: 700, color: '#818cf8', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 };
const sectionTitle = {
  fontSize: 'clamp(1.6rem,4vw,2.2rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2,
  background: 'linear-gradient(135deg, #f1f5f9 0%, rgba(241,245,249,0.75) 100%)',
  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
};
const glassCard = {
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 20, backdropFilter: 'blur(20px)',
};

export default function About() {
  useEffect(() => { document.title = 'About | Vpayit'; }, []);
  const [showContact, setShowContact] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: '#060c1a', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}

      {/* Ambient */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `
          radial-gradient(ellipse 70% 50% at 15% 0%, rgba(99,102,241,0.1), transparent),
          radial-gradient(ellipse 50% 40% at 85% 20%, rgba(168,85,247,0.07), transparent)
        `,
      }} />
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem', height: 64,
        background: 'rgba(6,12,26,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(99,102,241,0.4)',
          }}>
            <Zap size={16} color="white" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#f1f5f9' }}>Vpayit</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to="/pricing" style={{ fontSize: 14, fontWeight: 500, color: 'rgba(148,163,184,0.8)', padding: '8px 12px', textDecoration: 'none' }}>Pricing</Link>
          <Link to="/auth/login" style={{ fontSize: 14, fontWeight: 500, color: 'rgba(148,163,184,0.8)', padding: '8px 12px', textDecoration: 'none' }}>Log in</Link>
          <Link to="/auth/register" style={{
            fontSize: 14, fontWeight: 600, color: '#fff', padding: '8px 16px',
            borderRadius: 8, textDecoration: 'none',
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            boxShadow: '0 0 16px rgba(99,102,241,0.35)',
          }}>Get started</Link>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* HERO */}
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px 72px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 999, padding: '6px 16px', marginBottom: 28,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#818cf8' }}>Our story</span>
          </div>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 6vw, 3.5rem)', fontWeight: 800, letterSpacing: '-0.04em',
            lineHeight: 1.1, marginBottom: 20,
          }}>
            Making business bills{' '}
            <span style={{
              background: 'linear-gradient(135deg,#818cf8,#c084fc)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>simple.</span>
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(148,163,184,0.85)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>
            Vpayit helps UK small businesses take control of their recurring bills, find better deals, and save thousands every year.
          </p>
        </div>

        {/* OUR STORY */}
        <div style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 56, alignItems: 'center' }}>
              <div>
                <p style={sectionLabel}>Our story</p>
                <h2 style={{ ...sectionTitle, marginBottom: 20 }}>Born from a simple frustration</h2>
                <p style={{ fontSize: 15, color: 'rgba(148,163,184,0.85)', lineHeight: 1.75, marginBottom: 16 }}>
                  Founded in 2025, Vpayit was born from a simple frustration — UK small businesses waste hours every month managing bills and overpay by thousands because comparing suppliers is painful.
                </p>
                <p style={{ fontSize: 15, color: 'rgba(148,163,184,0.85)', lineHeight: 1.75 }}>
                  Using Open Banking technology, Vpayit automatically connects to your business bank account, detects every recurring payment, and compares your costs against 30+ UK suppliers.
                </p>
              </div>
              {/* Mini dashboard illustration */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { icon: Zap, iconColor: '#fbbf24', iconBg: 'rgba(251,191,36,0.1)', name: 'British Gas', sub: 'Energy · Monthly', val: '£342', valColor: '#fbbf24' },
                  { icon: Shield, iconColor: '#818cf8', iconBg: 'rgba(99,102,241,0.1)', name: 'Business Rates', sub: 'Annual · Hackney Council', val: '£485', valColor: '#e2e8f0' },
                  { icon: Shield, iconColor: '#f87171', iconBg: 'rgba(239,68,68,0.1)', name: 'Aviva Insurance', sub: 'Renews in 45 days', val: '£156', valColor: '#f87171' },
                ].map(({ icon: Icon, iconColor, iconBg, name, sub, val, valColor }) => (
                  <div key={name} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                    ...glassCard,
                  }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={16} color={iconColor} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', marginBottom: 2 }}>{name}</p>
                      <p style={{ fontSize: 11, color: 'rgba(100,116,139,0.8)' }}>{sub}</p>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: valColor, flexShrink: 0 }}>{val}</p>
                  </div>
                ))}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                  background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: 16,
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <TrendingDown size={16} color="#34d399" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#34d399', marginBottom: 2 }}>3 savings found</p>
                    <p style={{ fontSize: 11, color: 'rgba(52,211,153,0.7)', fontWeight: 500 }}>You could save £1,240/year</p>
                  </div>
                  <span style={{ color: '#34d399', fontSize: 16, fontWeight: 700 }}>→</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* THE PROBLEM */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={sectionLabel}>The problem we solve</p>
            <h2 style={{ ...sectionTitle, marginBottom: 12 }}>UK SMEs are leaving money on the table</h2>
            <p style={{ fontSize: 15, color: 'rgba(148,163,184,0.75)', maxWidth: 480, margin: '0 auto' }}>
              The numbers are stark — and the solution has been missing until now.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {PROBLEMS.map((p) => (
              <div
                key={p.num}
                style={{ ...glassCard, padding: 28, position: 'relative', overflow: 'hidden', cursor: 'default', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(99,102,241,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <span style={{
                  position: 'absolute', top: 8, right: 14,
                  fontSize: 52, fontWeight: 900, color: 'rgba(255,255,255,0.03)',
                  lineHeight: 1, userSelect: 'none',
                }}>{p.num}</span>
                <p style={{
                  fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8,
                  background: 'linear-gradient(135deg,#818cf8,#c084fc)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>{p.stat}</p>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>{p.title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.75)', lineHeight: 1.65 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* BUSINESS MODEL */}
        <div style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: 680, margin: '0 auto', padding: '72px 24px', textAlign: 'center' }}>
            <p style={sectionLabel}>How we work</p>
            <h2 style={{ ...sectionTitle, marginBottom: 24 }}>Aligned with your interests</h2>
            <p style={{ fontSize: 16, color: 'rgba(148,163,184,0.85)', lineHeight: 1.75, marginBottom: 16 }}>
              Vpayit is free for basic use. We earn revenue when we successfully help you switch to a better deal — the new supplier pays us a referral fee. You save money, we earn a commission. Everyone wins.
            </p>
            <p style={{ fontSize: 16, color: 'rgba(148,163,184,0.85)', lineHeight: 1.75, marginBottom: 32 }}>
              We never charge you to save money. Our interests are aligned with yours.
            </p>
            <div style={{
              background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 16, padding: '20px 24px', textAlign: 'left',
              display: 'flex', alignItems: 'flex-start', gap: 14,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Zap size={16} color="#818cf8" />
              </div>
              <p style={{ fontSize: 14, color: 'rgba(148,163,184,0.9)', lineHeight: 1.65 }}>
                <strong style={{ color: '#818cf8' }}>No conflicts of interest.</strong> We only recommend a switch when the saving is genuine. We show you the numbers transparently so you can decide — no pressure, no hidden commissions, no sponsored results.
              </p>
            </div>
          </div>
        </div>

        {/* VISION & MISSION */}
        <div style={{ background: 'rgba(6,12,26,0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <p style={{ ...sectionLabel, color: 'rgba(148,163,184,0.5)' }}>Our purpose</p>
              <h2 style={{ ...sectionTitle }}>Why we exist</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              <div style={{
                ...glassCard, padding: 40, position: 'relative', overflow: 'hidden',
                background: 'rgba(255,255,255,0.03)',
              }}>
                <div style={{ position: 'absolute', bottom: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.02)' }} />
                <p style={{ ...sectionLabel, color: 'rgba(148,163,184,0.4)' }}>Vision</p>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.35 }}>
                  A world where no small business overpays for essential services
                </h3>
              </div>
              <div style={{
                padding: 40, borderRadius: 20, position: 'relative', overflow: 'hidden',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
                border: '1px solid rgba(99,102,241,0.25)',
              }}>
                <div style={{ position: 'absolute', bottom: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(99,102,241,0.08)' }} />
                <p style={{ ...sectionLabel, color: 'rgba(129,140,248,0.6)' }}>Mission</p>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.35 }}>
                  To give every UK SME the tools to manage, track, and reduce their business bills — automatically
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* VALUES */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={sectionLabel}>Our values</p>
            <h2 style={{ ...sectionTitle, marginBottom: 12 }}>What we stand for</h2>
            <p style={{ fontSize: 15, color: 'rgba(148,163,184,0.7)', maxWidth: 440, margin: '0 auto' }}>
              Three principles guide everything we build and every decision we make.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {VALUES.map(({ icon: Icon, color, bg, title, desc }) => (
              <div
                key={title}
                style={{ ...glassCard, padding: 28, transition: 'border-color 0.2s, box-shadow 0.2s', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(99,102,241,0.07)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12, background: bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
                }}>
                  <Icon size={20} color={color} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.8)', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* TEAM */}
        <div style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <p style={sectionLabel}>The team</p>
              <h2 style={{ ...sectionTitle, marginBottom: 12 }}>People building Vpayit</h2>
              <p style={{ fontSize: 15, color: 'rgba(148,163,184,0.7)', maxWidth: 440, margin: '0 auto' }}>
                A small, focused team with deep experience in financial services and technology.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              {TEAM.map(({ initials, name, role, bio, tags, gradient, placeholder }) => (
                <div
                  key={role}
                  style={{
                    ...glassCard, padding: 28, textAlign: 'center',
                    borderStyle: placeholder ? 'dashed' : 'solid',
                    borderColor: placeholder ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.07)',
                  }}
                >
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: 22, fontWeight: 700, color: placeholder ? 'rgba(148,163,184,0.4)' : '#fff',
                    boxShadow: placeholder ? 'none' : '0 0 24px rgba(99,102,241,0.3)',
                  }}>
                    {initials}
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: placeholder ? 'rgba(100,116,139,0.6)' : '#f1f5f9', marginBottom: 4 }}>{name}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: placeholder ? 'rgba(100,116,139,0.5)' : '#818cf8', marginBottom: 14 }}>{role}</p>
                  <p style={{ fontSize: 12, color: placeholder ? 'rgba(100,116,139,0.5)' : 'rgba(148,163,184,0.75)', lineHeight: 1.65, marginBottom: 16, fontStyle: placeholder ? 'italic' : 'normal' }}>{bio}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                    {tags.map(tag => (
                      <span key={tag} style={{
                        padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                        background: placeholder ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.12)',
                        color: placeholder ? 'rgba(100,116,139,0.5)' : '#818cf8',
                        border: `1px solid ${placeholder ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.2)'}`,
                      }}>{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CONTACT */}
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '72px 24px', textAlign: 'center' }}>
          <p style={sectionLabel}>Get in touch</p>
          <h2 style={{ ...sectionTitle, marginBottom: 12 }}>We'd love to hear from you</h2>
          <p style={{ fontSize: 15, color: 'rgba(148,163,184,0.75)', marginBottom: 48, lineHeight: 1.7, maxWidth: 400, margin: '0 auto 48px' }}>
            Whether you have a question, a partnership idea, or just want to say hello — our inbox is always open.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 32, marginBottom: 40 }}>
            {[
              { icon: Mail, color: '#818cf8', bg: 'rgba(99,102,241,0.12)', label: 'Email', value: 'hello@vpayit.co.uk', href: 'mailto:hello@vpayit.co.uk' },
              { icon: MapPin, color: '#34d399', bg: 'rgba(16,185,129,0.12)', label: 'Location', value: 'London, UK', href: null },
            ].map(({ icon: Icon, color, bg, label, value, href }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} color={color} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(100,116,139,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>{label}</p>
                  {href ? (
                    <a href={href} style={{ fontSize: 14, fontWeight: 600, color: '#818cf8', textDecoration: 'none' }}>{value}</a>
                  ) : (
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(226,232,240,0.85)' }}>{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowContact(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 32px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color: '#fff', fontSize: 15, fontWeight: 600,
              boxShadow: '0 0 24px rgba(99,102,241,0.4)',
              transition: 'box-shadow 0.2s, transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 40px rgba(99,102,241,0.65)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 24px rgba(99,102,241,0.4)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Send us a message →
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '24px', textAlign: 'center', fontSize: 12, color: 'rgba(100,116,139,0.7)' }}>
        © {new Date().getFullYear()} Vpayit Ltd ·{' '}
        <a href="https://vpayit.co.uk" style={{ color: '#818cf8', textDecoration: 'none' }}>vpayit.co.uk</a>
      </div>
    </div>
  );
}
