import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2, Loader2, BarChart3, Receipt, Shield,
  Check, ArrowRight, Play, TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEMO_EMAIL    = 'demo@vpayit.co.uk';
const DEMO_PASSWORD = 'demo123';

const STATS = [
  { value: '£1,900', label: 'avg. annual saving per SME' },
  { value: '4+ hrs', label: 'saved per month on admin' },
  { value: '73%',    label: 'of SMEs are overpaying today' },
];

const FEATURES = [
  {
    icon: Receipt,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    title: 'Automatic bill detection',
    desc: 'Connects to your bank and identifies every recurring payment — energy, water, insurance, telecoms, software and more.',
  },
  {
    icon: TrendingUp,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    title: 'Smart savings finder',
    desc: 'Compares your bills against 30+ UK suppliers to find better deals. Average savings of £800 to £2,000 per year.',
  },
  {
    icon: BarChart3,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    title: 'Spending analytics',
    desc: 'Track your business spending with monthly reports, category breakdowns, and trend analysis.',
  },
  {
    icon: Shield,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    title: 'Bill alerts and reminders',
    desc: 'Get notified before bills are due so you never miss a payment or overpay again.',
  },
];

const STEPS = [
  {
    number: '1',
    title: 'Sign up free',
    desc: 'Create your account in 2 minutes. No credit card required.',
    tag: '2 min setup',
  },
  {
    number: '2',
    title: 'Connect your bank',
    desc: 'Securely link your business bank via Open Banking. Read-only access, 60 seconds.',
    tag: 'Read-only access',
  },
  {
    number: '3',
    title: 'Save automatically',
    desc: 'Vpayit detects your bills, finds better deals, and shows you exactly where to save.',
    tag: 'Automatic detection',
  },
];

const VISION_PHASES = [
  {
    phase: 'Phase 1',
    badge: 'Live Now',
    badgeStyle: 'live',
    title: 'See & Save',
    desc: 'Connect your business bank, automatically detect all recurring bills, and find cheaper alternatives across energy, telecoms, insurance, and more.',
  },
  {
    phase: 'Phase 2',
    badge: 'Coming 2027',
    badgeStyle: 'coming',
    title: 'One Payment',
    desc: 'Pay all your business bills in one consolidated monthly payment through Vpayit. One direct debit, zero hassle, full visibility.',
  },
  {
    phase: 'Phase 3',
    badge: 'Register your interest',
    badgeStyle: 'interest',
    title: 'Vpayit Now, Youpayit Later',
    desc: 'Short on cash one month? Vpayit covers your bills and you repay us on your terms. 0% interest for 14 days. Small fee if you spread over 4 weeks.',
  },
];

const TESTIMONIALS = [
  {
    quote: '"The dashboard is brilliant — I can see every bill in one place. As a restaurant owner, knowing exactly what\'s going out each month has transformed how I manage cash flow."',
    name: 'Anwar Hussain',
    company: 'The Spice Garden, Manchester',
  },
  {
    quote: '"The upcoming credit feature is exactly what my clients need. So many small businesses struggle with cash flow around bill dates. Vpayit is solving a very real problem."',
    name: 'Priya Mehta',
    company: 'Mehta Accounting, Birmingham',
  },
  {
    quote: '"I had no idea I was paying £340 a year more than I needed to on my business energy. Vpayit flagged it in the first week. Switched supplier, sorted."',
    name: 'David Clarke',
    company: 'Clarke Electrical, Bristol',
  },
];

const PLANS = [
  {
    name: 'Standard',
    price: '£9.99',
    period: '/month',
    features: ['1 bank connection', 'All bills tracked', 'Bill alerts & reminders', 'Monthly spending report', 'Savings finder'],
    cta: 'Get started free',
    featured: false,
    soonFeatures: [],
  },
  {
    name: 'Premium',
    price: '£17.99',
    period: '/month',
    features: ['Everything in Standard', 'Unlimited bank connections', 'PDF reports & analytics', 'Consolidated bill payment', 'Vpayit Credit access', 'Priority support'],
    soonFeatures: ['Consolidated bill payment', 'Vpayit Credit access'],
    cta: 'Get started free',
    featured: true,
  },
];

export default function Welcome() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError,   setDemoError]   = useState('');

  useEffect(() => { document.title = 'Vpayit — Smart bill management for UK businesses'; }, []);

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  async function handleDemo() {
    setDemoError('');
    setDemoLoading(true);
    try {
      await signIn(DEMO_EMAIL, DEMO_PASSWORD);
      navigate('/dashboard', { replace: true });
    } catch {
      setDemoError('Demo account unavailable — please try logging in manually.');
    } finally {
      setDemoLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <a href="https://vpayit.co.uk" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">Vpayit</span>
          </a>
          <div className="hidden md:flex items-center gap-1">
            <a href="https://vpayit.co.uk/#features" className="text-sm font-medium text-slate-500 hover:text-blue-600 px-3 py-2 rounded-lg transition-colors hover:bg-blue-50">Features</a>
            <Link to="/pricing" className="text-sm font-medium text-slate-500 hover:text-blue-600 px-3 py-2 rounded-lg transition-colors hover:bg-blue-50">Pricing</Link>
            <a href="https://vpayit.co.uk/about.html" className="text-sm font-medium text-slate-500 hover:text-blue-600 px-3 py-2 rounded-lg transition-colors hover:bg-blue-50">About</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth/login" className="text-sm font-medium text-slate-500 hover:text-blue-600 px-3 py-2 transition-colors">
              Log in
            </Link>
            <Link
              to="/auth/register"
              className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-16 px-6 text-center" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(37,99,235,0.06), transparent)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 text-sm font-semibold text-blue-700 mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Smart bill management for UK businesses
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight mb-6">
            Stop overpaying on<br />
            <span className="text-blue-600">business bills</span>
          </h1>

          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-4 leading-relaxed">
            Vpayit connects to your bank, detects recurring bills, and finds cheaper alternatives. UK businesses save an average of £1,900/year.
          </p>
          <p className="text-base font-semibold text-violet-600 max-w-2xl mx-auto mb-10">
            And soon — if you&apos;re short one month, we&apos;ve got you covered.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
            <Link
              to="/auth/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-base transition-colors shadow-lg shadow-blue-600/25"
            >
              Get started free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={handleDemo}
              disabled={demoLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-base transition-colors disabled:opacity-60"
            >
              {demoLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading demo</>
                : <><Play className="w-4 h-4" /> View live demo</>}
            </button>
          </div>

          {demoError && <p className="mb-4 text-sm text-red-600">{demoError}</p>}

          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> TrueLayer Open Banking</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Bank-grade encryption</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Read-only access</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> FCA regulated partners</span>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 bg-slate-50 rounded-2xl border border-slate-200">
            {STATS.map(({ value, label }) => (
              <div key={label} className="py-10 px-8 text-center">
                <div className="text-4xl font-extrabold text-blue-600 tracking-tight mb-2">{value}</div>
                <div className="text-sm text-slate-500 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-white" id="features">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">Features</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">Everything your business needs</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-7 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mb-5`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6 bg-slate-50" id="how-it-works">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">How it works</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Up and running in <span className="text-blue-600">3 simple steps</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STEPS.map(({ number, title, desc, tag }) => (
              <div key={number} className="bg-white rounded-2xl p-7 border border-slate-100 shadow-sm flex flex-col gap-4">
                <div className="w-10 h-10 bg-blue-600 text-white font-extrabold text-lg rounded-xl flex items-center justify-center shrink-0">
                  {number}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </div>
                <span className="mt-auto text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 self-start">
                  {tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Vision */}
      <section className="py-16 px-6 bg-slate-50" id="vision">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">Our Vision</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Building the future of <span className="text-blue-600">bill management</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {VISION_PHASES.map(({ phase, badge, badgeStyle, title, desc }, i) => (
              <div
                key={phase}
                className={`rounded-2xl p-7 flex flex-col gap-4 ${
                  i === 2
                    ? 'bg-gradient-to-br from-violet-900 via-violet-700 to-indigo-700 shadow-xl'
                    : `bg-white border shadow-sm ${i === 0 ? 'border-blue-500 border-2' : 'border-slate-100'}`
                }`}
              >
                <span className={`text-xs font-bold tracking-widest uppercase ${i === 2 ? 'text-violet-300' : 'text-slate-400'}`}>{phase}</span>
                <span className={`self-start text-xs font-bold px-3 py-1 rounded-full ${
                  badgeStyle === 'live'    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  badgeStyle === 'coming' ? 'bg-slate-100 text-slate-500 border border-slate-200' :
                                             'bg-white/20 text-white border border-white/30'
                }`}>
                  {badgeStyle === 'live' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5 align-middle" />}
                  {badge}
                </span>
                <h3 className={`font-extrabold text-lg tracking-tight ${i === 2 ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
                <p className={`text-sm leading-relaxed flex-1 ${i === 2 ? 'text-violet-200' : 'text-slate-500'}`}>{desc}</p>
                {i === 2 && (
                  <a href="mailto:hello@vpayit.co.uk?subject=Vpayit Credit - Register Interest"
                     className="self-start text-sm font-semibold text-white bg-white/20 hover:bg-white/30 border border-white/30 px-4 py-2 rounded-lg transition-colors">
                    Register interest
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vpayit Credit */}
      <section className="py-16 px-6" id="credit" style={{ background: 'linear-gradient(135deg,#3B0764,#4C1D95,#6D28D9)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block text-xs font-bold tracking-widest uppercase text-violet-300 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full mb-5">
                Vpayit Credit
              </span>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4 leading-tight">
                Your bills covered when you need it most
              </h2>
              <p className="text-violet-200 leading-relaxed mb-6">
                When cash flow is tight, Vpayit steps in to cover the gap. We pay your bills, you repay us on your terms.
              </p>

              <div className="bg-white/10 border border-white/15 rounded-xl p-5 mb-6">
                {[
                  { label: 'Monthly bills', amount: '£1,300', highlight: false },
                  { label: 'Cash available', amount: '£1,000', highlight: false },
                  { label: 'Vpayit covers', amount: '£300',   highlight: true  },
                ].map(({ label, amount, highlight }) => (
                  <div key={label} className={`flex justify-between items-center text-sm py-1.5 ${highlight ? 'font-bold text-white border-t border-white/15 mt-2 pt-3' : 'text-violet-200'}`}>
                    <span>{label}</span>
                    <span className={highlight ? 'text-violet-300' : 'text-white font-medium'}>{amount}</span>
                  </div>
                ))}
              </div>

              <ul className="space-y-2.5 mb-8">
                {['0% interest if repaid within 14 days', 'Small fee if spread over 4 weekly instalments', 'Available on Premium plan (coming soon)'].map(t => (
                  <li key={t} className="flex items-center gap-2.5 text-sm text-violet-200">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" stroke="#A78BFA" strokeWidth="1.5"/>
                      <polyline points="5,8 7,10 11,6" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {t}
                  </li>
                ))}
              </ul>

              <a href="mailto:hello@vpayit.co.uk?subject=Vpayit Credit - Register Interest"
                 className="inline-flex items-center gap-2 px-7 py-3 bg-white text-violet-800 font-bold rounded-xl hover:shadow-lg transition-all hover:-translate-y-0.5">
                Register interest
              </a>
            </div>

            {/* Credit cards visual */}
            <div className="relative h-72 md:h-80 flex items-center justify-center" aria-hidden="true">
              <style>{`
                @keyframes floatF{0%,100%{transform:translate(-55%,-50%) rotate(-6deg)}50%{transform:translate(-55%,-62%) rotate(-6deg)}}
                @keyframes floatB{0%,100%{transform:translate(-42%,-46%) rotate(4deg)}50%{transform:translate(-42%,-56%) rotate(4deg)}}
              `}</style>
              {/* Back card */}
              <div style={{
                position:'absolute', left:'50%', top:'50%',
                width:'280px', height:'175px', borderRadius:'14px', padding:'18px',
                background:'linear-gradient(135deg,#1E1B4B,#312E81,#1E3A8A)',
                boxShadow:'0 12px 40px rgba(30,27,75,0.5)',
                display:'flex', flexDirection:'column', justifyContent:'space-between',
                animation:'floatB 7s ease-in-out infinite',
              }}>
                <div style={{background:'rgba(0,0,0,0.4)',height:'32px',margin:'0 -18px',marginTop:'4px'}} />
                <p style={{fontSize:'0.78rem',color:'rgba(255,255,255,0.65)',fontStyle:'italic',textAlign:'center'}}>Pay your bills. We&apos;ve got your back.</p>
                <div style={{background:'rgba(255,255,255,0.12)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'100px',padding:'4px 14px',fontSize:'0.68rem',fontWeight:700,color:'#C4B5FD',textAlign:'center',alignSelf:'center'}}>
                  0% interest for 14 days
                </div>
              </div>
              {/* Front card */}
              <div style={{
                position:'absolute', left:'50%', top:'50%',
                width:'280px', height:'175px', borderRadius:'14px', padding:'18px',
                background:'linear-gradient(135deg,#7C3AED,#4C1D95,#2563EB)',
                boxShadow:'0 20px 60px rgba(124,58,237,0.5)',
                display:'flex', flexDirection:'column', justifyContent:'space-between',
                animation:'floatF 5s ease-in-out infinite',
              }}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                  <div style={{width:'32px',height:'24px',background:'linear-gradient(135deg,#F59E0B,#D97706)',borderRadius:'4px'}} />
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'1px'}}>
                    <span style={{fontSize:'0.8rem',fontWeight:800,color:'rgba(255,255,255,0.9)',letterSpacing:'-0.02em'}}>Vpayit</span>
                    <span style={{fontSize:'0.58rem',fontWeight:700,letterSpacing:'0.14em',color:'rgba(255,255,255,0.5)',textTransform:'uppercase'}}>Credit</span>
                  </div>
                </div>
                <div style={{fontFamily:'monospace',fontSize:'0.72rem',letterSpacing:'0.16em',color:'rgba(255,255,255,0.65)'}}>
                  &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 4291
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
                  <div>
                    <div style={{fontSize:'0.56rem',textTransform:'uppercase',letterSpacing:'0.1em',color:'rgba(255,255,255,0.45)',marginBottom:'2px'}}>Available</div>
                    <div style={{fontSize:'0.82rem',fontWeight:700,color:'#fff'}}>£500.00</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:'0.56rem',textTransform:'uppercase',letterSpacing:'0.1em',color:'rgba(255,255,255,0.45)',marginBottom:'2px'}}>Valid thru</div>
                    <div style={{fontSize:'0.82rem',fontWeight:700,color:'#fff'}}>12/28</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">Social proof</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">Used by UK businesses like yours</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ quote, name, company }) => (
              <div key={name} className="bg-white rounded-2xl p-7 border border-slate-100 shadow-sm">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-amber-400" viewBox="0 0 14 14">
                      <polygon points="7,1 8.8,5.5 13.5,5.5 9.7,8.2 11.2,12.8 7,10 2.8,12.8 4.3,8.2 0.5,5.5 5.2,5.5" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-5">{quote}</p>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{name}</p>
                  <p className="text-xs text-slate-400">{company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-6 bg-slate-50" id="pricing">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">Pricing</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Simple, <span className="text-blue-600">transparent pricing</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {PLANS.map(({ name, price, period, features, soonFeatures, cta, featured }) => (
              <div
                key={name}
                className={`rounded-2xl p-7 flex flex-col gap-6 ${
                  featured
                    ? 'bg-blue-600 shadow-xl shadow-blue-600/30 ring-2 ring-blue-600'
                    : 'bg-white border border-slate-100 shadow-sm'
                }`}
              >
                {featured && (
                  <span className="text-xs font-bold bg-white/20 text-white px-3 py-1 rounded-full self-start">
                    Most popular
                  </span>
                )}
                <div>
                  <div className={`text-sm font-bold mb-1 ${featured ? 'text-blue-100' : 'text-slate-500'}`}>{name}</div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-extrabold tracking-tight ${featured ? 'text-white' : 'text-slate-900'}`}>{price}</span>
                    <span className={`text-sm ${featured ? 'text-blue-100' : 'text-slate-400'}`}>{period}</span>
                  </div>
                </div>
                <ul className="flex-1 space-y-2.5">
                  {features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${featured ? 'text-blue-200' : 'text-blue-600'}`} />
                      <span className={featured ? 'text-blue-50' : 'text-slate-600'}>
                        {f}
                        {soonFeatures?.includes(f) && (
                          <span className="ml-1.5 text-xs font-bold bg-violet-100 text-violet-700 border border-violet-200 px-1.5 py-0.5 rounded-full align-middle">Soon</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/auth/register"
                  className={`block text-center py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                    featured
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-blue-600 rounded-3xl p-12 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">Ready to stop overpaying?</h2>
            <p className="text-blue-100 mb-8 text-lg leading-relaxed">
              Join hundreds of UK businesses already saving with Vpayit.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/auth/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors"
              >
                Get started free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={handleDemo}
                disabled={demoLoading}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors disabled:opacity-60"
              >
                {demoLoading ? 'Loading...' : 'View demo'}
              </button>
            </div>
            <p className="mt-4 text-sm text-blue-200">14-day free trial. No credit card required. Cancel anytime.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">Vpayit</span>
          </div>
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Vpayit Ltd &middot;{' '}
            <a href="https://vpayit.co.uk" className="hover:text-blue-600 transition-colors">vpayit.co.uk</a>
          </p>
        </div>
      </footer>

    </div>
  );
}
