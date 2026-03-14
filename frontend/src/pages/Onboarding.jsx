import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Shield, CheckCircle2, ArrowRight, ArrowLeft, Loader2, TrendingDown, BarChart3, Lock, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { api } from '../lib/api';

const BUSINESS_TYPES = ['Sole Trader', 'Limited Company', 'Partnership', 'LLP', 'CIC', 'Charity', 'Other'];

const STEPS = [
  { id: 1, label: 'Welcome'      },
  { id: 2, label: 'Connect bank' },
  { id: 3, label: 'All set!'     },
];

export default function Onboarding() {
  const { user, profile, fetchProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]       = useState(1);
  const [saving, setSaving]   = useState(false);
  const [connecting, setConn] = useState(false);

  const [form, setForm] = useState({
    business_name: '',
    business_type: '',
  });

  useEffect(() => {
    document.title = 'Welcome to Vpayit';
    if (profile) {
      setForm({
        business_name: profile.business_name || '',
        business_type: profile.business_type || '',
      });
    }
  }, [profile]);

  async function handleSaveProfile() {
    if (!form.business_name.trim()) return;
    setSaving(true);
    try {
      await supabase.from('users').upsert(
        { id: user.id, email: user.email, ...form },
        { onConflict: 'id' },
      );
      await fetchProfile(user.id);
      setStep(2);
    } catch { /* proceed anyway */ }
    finally { setSaving(false); }
  }

  async function handleConnectBank() {
    setConn(true);
    try {
      const { url } = await api.banks.authUrl();
      localStorage.setItem('vpayit_onboarding_bank_pending', '1');
      window.location.href = url;
    } catch {
      setConn(false);
    }
  }

  function handleFinish() {
    localStorage.setItem('vpayit_onboarding_completed', '1');
    navigate('/dashboard');
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#f1f5f9', fontSize: 14, outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box',
  };
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(148,163,184,0.9)', marginBottom: 6 };

  return (
    <div style={{
      minHeight: '100vh', background: '#060c1a', color: '#e2e8f0',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 60% 50% at 25% 10%, rgba(99,102,241,0.12), transparent),
          radial-gradient(ellipse 50% 40% at 75% 85%, rgba(168,85,247,0.08), transparent)
        `,
      }} />
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      <div style={{ width: '100%', maxWidth: 520, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
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
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                transition: 'all 0.3s',
                background: step === s.id
                  ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
                  : step > s.id
                    ? 'rgba(16,185,129,0.15)'
                    : 'rgba(255,255,255,0.05)',
                color: step === s.id
                  ? '#fff'
                  : step > s.id
                    ? '#34d399'
                    : 'rgba(100,116,139,0.7)',
                border: step === s.id
                  ? 'none'
                  : step > s.id
                    ? '1px solid rgba(16,185,129,0.3)'
                    : '1px solid rgba(255,255,255,0.08)',
                boxShadow: step === s.id ? '0 0 16px rgba(99,102,241,0.4)' : 'none',
              }}>
                {step > s.id
                  ? <CheckCircle2 size={13} strokeWidth={2.5} />
                  : <span style={{ fontSize: 11 }}>{s.id}</span>
                }
                {s.label}
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  width: 24, height: 1.5, borderRadius: 1,
                  background: step > s.id ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.08)',
                  transition: 'background 0.3s',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, overflow: 'hidden',
        }}>

          {/* ── Step 1: Welcome ── */}
          {step === 1 && (
            <div style={{ padding: 36 }}>
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 16,
                  background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <Zap size={28} color="#818cf8" strokeWidth={2} />
                </div>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Welcome to Vpayit!</h1>
                <p style={{ fontSize: 14, color: 'rgba(148,163,184,0.75)', lineHeight: 1.6 }}>
                  Let's set up your business profile. This takes 30 seconds.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={labelStyle}>Business name <span style={{ color: '#f87171' }}>*</span></label>
                  <input
                    type="text" value={form.business_name}
                    onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))}
                    placeholder="e.g. Acme Plumbing Ltd"
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Business type</label>
                  <select
                    value={form.business_type}
                    onChange={e => setForm(f => ({ ...f, business_type: e.target.value }))}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                  >
                    <option value="">Select type…</option>
                    {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving || !form.business_name.trim()}
                style={{
                  marginTop: 24, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '13px 24px', borderRadius: 12, border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  color: '#fff', fontSize: 14, fontWeight: 600,
                  boxShadow: '0 0 24px rgba(99,102,241,0.4)',
                  opacity: (saving || !form.business_name.trim()) ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                {saving ? 'Saving…' : 'Continue'}
              </button>
            </div>
          )}

          {/* ── Step 2: Connect bank ── */}
          {step === 2 && (
            <div style={{ padding: 36 }}>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 16,
                  background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <Shield size={28} color="#34d399" strokeWidth={2} />
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Connect your bank</h2>
                <p style={{ fontSize: 14, color: 'rgba(148,163,184,0.75)', lineHeight: 1.6 }}>
                  Link your business bank account to automatically detect bills and find savings.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {[
                  { icon: Lock, color: '#818cf8', bg: 'rgba(99,102,241,0.1)', title: 'Bank-grade security', desc: 'Powered by TrueLayer — FCA regulated Open Banking' },
                  { icon: Eye, color: '#34d399', bg: 'rgba(16,185,129,0.1)', title: 'Read-only access', desc: 'We can see your transactions, but never move money' },
                  { icon: Zap, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', title: 'Instant bill detection', desc: 'We automatically identify all your recurring bills' },
                ].map(({ icon: Icon, color, bg, title, desc }) => (
                  <div key={title} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12, padding: 14,
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 12,
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                      background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={16} color={color} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 3 }}>{title}</p>
                      <p style={{ fontSize: 12, color: 'rgba(100,116,139,0.9)' }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleConnectBank}
                disabled={connecting}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '13px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  color: '#fff', fontSize: 14, fontWeight: 600,
                  boxShadow: '0 0 24px rgba(99,102,241,0.4)',
                  opacity: connecting ? 0.7 : 1, transition: 'opacity 0.2s',
                }}
              >
                {connecting ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                {connecting ? 'Redirecting…' : 'Connect bank securely'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', marginTop: 14 }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 13, color: 'rgba(100,116,139,0.7)', padding: 4,
                  }}
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  style={{
                    marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 13, color: 'rgba(100,116,139,0.7)', padding: 4,
                  }}
                >
                  Skip for now →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: All set ── */}
          {step === 3 && (
            <div style={{ padding: 36 }}>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 16,
                  background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <CheckCircle2 size={28} color="#34d399" strokeWidth={2} />
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>You're all set!</h2>
                <p style={{ fontSize: 14, color: 'rgba(148,163,184,0.75)', lineHeight: 1.6 }}>
                  Welcome{form.business_name ? `, ${form.business_name}` : ''}. Here's what Vpayit will do for you:
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                {[
                  {
                    icon: Zap, color: '#818cf8', bg: 'rgba(99,102,241,0.12)',
                    title: 'Detect your bills automatically',
                    desc: 'We scan your bank transactions and identify every recurring bill — energy, insurance, rates, telecoms, and more.',
                  },
                  {
                    icon: TrendingDown, color: '#34d399', bg: 'rgba(16,185,129,0.12)',
                    title: 'Find you cheaper alternatives',
                    desc: 'Vpayit compares your bills to the market and surfaces better deals. UK SMEs save an average of £1,900/year.',
                  },
                  {
                    icon: BarChart3, color: '#c084fc', bg: 'rgba(192,132,252,0.12)',
                    title: 'Track your spending over time',
                    desc: 'Monthly reports show exactly where your money goes and how your bills are trending.',
                  },
                ].map(({ icon: Icon, color, bg, title, desc }) => (
                  <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                      background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={16} color={color} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 3 }}>{title}</p>
                      <p style={{ fontSize: 12, color: 'rgba(100,116,139,0.9)', lineHeight: 1.6 }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleFinish}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '13px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  color: '#fff', fontSize: 14, fontWeight: 600,
                  boxShadow: '0 0 24px rgba(99,102,241,0.4)',
                  transition: 'box-shadow 0.2s, transform 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 36px rgba(99,102,241,0.65)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 24px rgba(99,102,241,0.4)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Go to my dashboard <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(100,116,139,0.6)', marginTop: 20 }}>
          By using Vpayit you agree to our{' '}
          <a href="https://vpayit.co.uk/terms.html" style={{ color: '#818cf8', textDecoration: 'none' }}>Terms</a>
          {' '}and{' '}
          <a href="https://vpayit.co.uk/privacy.html" style={{ color: '#818cf8', textDecoration: 'none' }}>Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
