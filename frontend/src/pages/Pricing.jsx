import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, Building2 } from 'lucide-react';

const TIERS = [
  {
    name: 'Free',
    price: '£0',
    period: '',
    description: 'Everything you need to get started tracking your business bills.',
    cta: 'Get started free',
    ctaTo: '/auth/register',
    ctaVariant: 'outline',
    highlight: false,
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
    ctaTo: '/auth/register',
    ctaVariant: 'solid',
    highlight: true,
    badge: 'Most popular',
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
    ctaTo: '/auth/register',
    ctaVariant: 'dark',
    highlight: false,
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

function ctaClass(variant) {
  if (variant === 'solid') return 'bg-blue-600 hover:bg-blue-700 text-white';
  if (variant === 'dark')  return 'bg-slate-900 hover:bg-slate-800 text-white';
  return 'border border-slate-300 hover:border-slate-400 text-slate-700 hover:bg-slate-50';
}

export default function Pricing() {
  useEffect(() => { document.title = 'Pricing | Vpayit'; }, []);

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
          <Link to="/about" className="text-sm font-medium text-slate-500 hover:text-blue-600 px-3 py-2 transition-colors">
            About
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

      {/* Header */}
      <div className="max-w-3xl mx-auto px-6 pt-20 pb-14 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-lg text-slate-500 max-w-xl mx-auto">
          Start free. Upgrade when you're ready. No hidden fees, no lock-in contracts.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl border p-8 flex flex-col ${
                tier.highlight
                  ? 'border-blue-500 shadow-xl shadow-blue-100 md:scale-105'
                  : 'border-slate-200'
              }`}
            >
              {tier.badge && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  {tier.badge}
                </span>
              )}

              {/* Plan info */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-1">{tier.name}</h2>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-extrabold text-slate-900">{tier.price}</span>
                  {tier.period && (
                    <span className="text-slate-400 text-sm">{tier.period}</span>
                  )}
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{tier.description}</p>
              </div>

              {/* Feature list */}
              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                to={tier.ctaTo}
                className={`block text-center py-3 px-6 rounded-xl font-semibold text-sm transition-colors ${ctaClass(tier.ctaVariant)}`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ note */}
        <div className="mt-14 text-center">
          <p className="text-sm text-slate-400">
            All paid plans include a 14-day free trial. Cancel anytime — no questions asked.
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Questions?{' '}
            <Link to="/about" className="text-blue-600 hover:underline font-medium">
              Contact our team
            </Link>
          </p>
        </div>

        {/* Feature comparison note */}
        <div className="mt-16 bg-slate-50 rounded-2xl border border-slate-200 p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4 text-center">All plans include</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'FCA-regulated Open Banking (TrueLayer)',
              'Bank-level SSL encryption',
              'Automatic bill detection',
              'UK-based infrastructure',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 text-sm text-slate-600">
                <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Vpayit Ltd ·{' '}
        <a href="https://vpayit.co.uk" className="hover:text-blue-600">
          vpayit.co.uk
        </a>
      </div>
    </div>
  );
}
