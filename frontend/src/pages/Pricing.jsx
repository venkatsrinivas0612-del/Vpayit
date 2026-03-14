import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Zap, Loader2, Shield, BarChart3, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

const TIERS = [
  {
    name: 'Free',
    price: '£0',
    period: '',
    description: 'Everything you need to get started tracking your business bills.',
    cta: 'Get started free',
    planId: null,
    highlight: false,
    accentColor: 'rgba(148,163,184,0.6)',
    features: [
      '1 bank connection',
      'Up to 5 bills tracked',
      'Basic spending reports',
      'Bill due date alerts',
      'Auto bill detection',
    ],
  },
  {
    name: 'Pro',
    price: '£19',
    period: '/month',
    description: 'For growing businesses that want full visibility and savings.',
    cta: 'Start 14-day trial',
    planId: 'pro',
    highlight: true,
    badge: 'Most popular',
    accentColor: '#818cf8',
    features: [
      'Unlimited bank connections',
      'Unlimited bills tracked',
      'PDF report export',
      'Priority savings alerts',
      'Bill price history charts',
      'Email notifications',
      'CSV data export',
    ],
  },
  {
    name: 'Business',
    price: '£49',
    period: '/month',
    description: 'For teams that need advanced controls and dedicated support.',
    cta: 'Start 14-day trial',
    planId: 'business',
    highlight: false,
    accentColor: '#c084fc',
    features: [
      'Everything in Pro',
      'Multi-user access (up to 10)',
      'API access',
      'Dedicated account manager',
      'Priority email & phone support',
      'Custom reporting',
      'SSO / SAML',
    ],
  },
];

const INCLUDED = [
  { icon: Shield, label: 'FCA-regulated Open Banking (TrueLayer)' },
  { icon: Zap,    label: 'Bank-level SSL encryption' },
  { icon: BarChart3, label: 'Automatic bill detection' },
  { icon: Globe,  label: 'UK-based infrastructure' },
];

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => { document.title = 'Pricing | Vpayit'; }, []);

  async function handlePaidCta(planId) {
    if (!user) {
      navigate('/auth/register', { state: { intendedPlan: planId } });
      return;
    }
    setLoadingPlan(planId);
    try {
      const { url } = await api.billing.checkout(planId);
      window.location.href = url;
    } catch (err) {
      alert(`Could not start checkout: ${err.message}`);
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060c1a', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
      {/* Ambient background */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `
          radial-gradient(ellipse 60% 40% at 20% 0%, rgba(99,102,241,0.12), transparent),
          radial-gradient(ellipse 50% 35% at 80% 10%, rgba(168,85,247,0.08), transparent)
        `,
      }} />

      {/* Dot pattern */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem', height: '64px',
        background: 'rgba(6,12,26,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
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
          <Link to="/about" style={{ fontSize: 14, fontWeight: 500, color: 'rgba(148,163,184,0.8)', padding: '8px 12px', textDecoration: 'none' }}>
            About
          </Link>
          {user ? (
            <Link to="/dashboard" style={{
              fontSize: 14, fontWeight: 600, color: '#fff', padding: '8px 16px',
              borderRadius: 8, textDecoration: 'none',
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            }}>
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/auth/login" style={{ fontSize: 14, fontWeight: 500, color: 'rgba(148,163,184,0.8)', padding: '8px 12px', textDecoration: 'none' }}>
                Log in
              </Link>
              <Link to="/auth/register" style={{
                fontSize: 14, fontWeight: 600, color: '#fff', padding: '8px 16px',
                borderRadius: 8, textDecoration: 'none',
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                boxShadow: '0 0 16px rgba(99,102,241,0.35)',
              }}>
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '80px 24px 60px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 999, padding: '6px 16px', marginBottom: 24,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8', display: 'inline-block' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#818cf8' }}>Simple pricing</span>
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em',
            marginBottom: 16, lineHeight: 1.1,
            background: 'linear-gradient(135deg, #f1f5f9 0%, rgba(241,245,249,0.7) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            Simple, transparent pricing
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(148,163,184,0.9)', lineHeight: 1.7 }}>
            Start free. Upgrade when you're ready. No hidden fees, no lock-in contracts.
          </p>
        </div>

        {/* Pricing cards */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, alignItems: 'start' }}>
            {TIERS.map((tier) => {
              const isHovered = hoveredCard === tier.name;
              const isHighlight = tier.highlight;
              return (
                <div
                  key={tier.name}
                  onMouseEnter={() => setHoveredCard(tier.name)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    position: 'relative',
                    background: isHighlight ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.03)',
                    border: isHighlight
                      ? '1px solid rgba(99,102,241,0.4)'
                      : isHovered
                        ? '1px solid rgba(255,255,255,0.12)'
                        : '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 20,
                    padding: 32,
                    display: 'flex', flexDirection: 'column',
                    transition: 'all 0.25s',
                    boxShadow: isHighlight
                      ? '0 0 40px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.06)'
                      : isHovered ? '0 0 24px rgba(255,255,255,0.04)' : 'none',
                    transform: isHighlight ? 'scale(1.03)' : 'scale(1)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  {tier.badge && (
                    <div style={{
                      position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                      color: '#fff', fontSize: 11, fontWeight: 700,
                      padding: '4px 14px', borderRadius: 999, whiteSpace: 'nowrap',
                      boxShadow: '0 0 16px rgba(99,102,241,0.5)',
                    }}>
                      {tier.badge}
                    </div>
                  )}

                  {/* Plan info */}
                  <div style={{ marginBottom: 24 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>{tier.name}</h2>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 10 }}>
                      <span style={{
                        fontSize: 40, fontWeight: 800, letterSpacing: '-0.04em',
                        background: isHighlight
                          ? 'linear-gradient(135deg,#818cf8,#c084fc)'
                          : `linear-gradient(135deg, ${tier.accentColor}, rgba(241,245,249,0.9))`,
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                      }}>{tier.price}</span>
                      {tier.period && (
                        <span style={{ fontSize: 14, color: 'rgba(148,163,184,0.6)' }}>{tier.period}</span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.8)', lineHeight: 1.6 }}>{tier.description}</p>
                  </div>

                  {/* Features */}
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {tier.features.map((feature) => (
                      <li key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13 }}>
                        <Check
                          size={14}
                          strokeWidth={2.5}
                          style={{ color: isHighlight ? '#818cf8' : '#34d399', flexShrink: 0, marginTop: 2 }}
                        />
                        <span style={{ color: 'rgba(226,232,240,0.85)' }}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {tier.planId === null ? (
                    <Link
                      to="/auth/register"
                      style={{
                        display: 'block', textAlign: 'center',
                        padding: '12px 24px', borderRadius: 12,
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: 'rgba(255,255,255,0.04)',
                        color: '#e2e8f0', fontSize: 14, fontWeight: 600,
                        textDecoration: 'none', transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                    >
                      {tier.cta}
                    </Link>
                  ) : (
                    <button
                      onClick={() => handlePaidCta(tier.planId)}
                      disabled={loadingPlan === tier.planId}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        width: '100%', padding: '12px 24px', borderRadius: 12, border: 'none',
                        cursor: 'pointer', fontSize: 14, fontWeight: 600,
                        background: isHighlight
                          ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
                          : 'rgba(139,92,246,0.15)',
                        color: '#fff',
                        boxShadow: isHighlight ? '0 0 24px rgba(99,102,241,0.4)' : 'none',
                        transition: 'all 0.2s',
                        opacity: loadingPlan === tier.planId ? 0.7 : 1,
                      }}
                      onMouseEnter={e => {
                        if (!isHighlight) e.currentTarget.style.background = 'rgba(139,92,246,0.25)';
                        else e.currentTarget.style.boxShadow = '0 0 36px rgba(99,102,241,0.6)';
                      }}
                      onMouseLeave={e => {
                        if (!isHighlight) e.currentTarget.style.background = 'rgba(139,92,246,0.15)';
                        else e.currentTarget.style.boxShadow = '0 0 24px rgba(99,102,241,0.4)';
                      }}
                    >
                      {loadingPlan === tier.planId && <Loader2 size={14} className="animate-spin" />}
                      {loadingPlan === tier.planId ? 'Redirecting…' : tier.cta}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* FAQ note */}
          <div style={{ marginTop: 48, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'rgba(100,116,139,0.8)' }}>
              All paid plans include a 14-day free trial. Cancel anytime — no questions asked.
            </p>
            <p style={{ fontSize: 13, color: 'rgba(100,116,139,0.8)', marginTop: 6 }}>
              Questions?{' '}
              <Link to="/about" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>
                Contact our team
              </Link>
            </p>
          </div>

          {/* All plans include */}
          <div style={{
            marginTop: 56,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 20, padding: 40,
            backdropFilter: 'blur(20px)',
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 24, textAlign: 'center' }}>
              All plans include
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
              {INCLUDED.map(({ icon: Icon, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={14} color="#818cf8" />
                  </div>
                  <span style={{ fontSize: 13, color: 'rgba(148,163,184,0.85)', lineHeight: 1.5, paddingTop: 6 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '24px', textAlign: 'center',
        fontSize: 12, color: 'rgba(100,116,139,0.7)',
      }}>
        © {new Date().getFullYear()} Vpayit Ltd ·{' '}
        <a href="https://vpayit.co.uk" style={{ color: '#818cf8', textDecoration: 'none' }}>
          vpayit.co.uk
        </a>
      </div>
    </div>
  );
}
