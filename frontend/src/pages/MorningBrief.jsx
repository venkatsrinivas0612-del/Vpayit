import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Loader2, Check, Sparkles, Rocket, TrendingUp, Building2 } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

/* ─── Segments ────────────────────────────────────────────────────────────── */
const SEGMENTS = [
  {
    id: 'aspiring',
    icon: Rocket,
    title: 'I have a business idea',
    subtitle: 'Not yet registered — planning to launch',
    colour: '#7C3AED',
    glow: 'rgba(124,58,237,0.14)',
  },
  {
    id: 'growth',
    icon: TrendingUp,
    title: 'I run a growing business',
    subtitle: 'Registered and actively building',
    colour: '#2563EB',
    glow: 'rgba(37,99,235,0.14)',
  },
  {
    id: 'executive',
    icon: Building2,
    title: 'I lead an established company',
    subtitle: 'CEO, Director or senior management',
    colour: '#0D9488',
    glow: 'rgba(13,148,136,0.14)',
  },
];

const INDUSTRIES = [
  'Technology / SaaS', 'Professional Services', 'Retail / E-commerce',
  'Hospitality / Food & Drink', 'Construction / Trades', 'Healthcare / Wellness',
  'Creative / Media / Marketing', 'Finance / Fintech', 'Education / Training', 'Other',
];

/* ─── Research-backed questions per segment ───────────────────────────────── */

// ASPIRING: 4 questions that change what the brief says the most
// Sources: HMRC registration triggers, British Business Bank startup research,
// FSB first-year survival data, Companies House compliance obligations by structure
const ASPIRING_Q = {
  structure: {
    label: 'What structure are you planning?',
    hint: 'This determines your tax calendar — Sole Traders file Self Assessment (31 Jan), Ltd companies file Corporation Tax 9 months after year-end. We calculate your specific deadlines from day one.',
    options: ['Limited Company (Ltd)', 'Sole Trader', 'Partnership / LLP', 'Not sure yet'],
  },
  employment: {
    label: 'What is your current situation?',
    hint: 'Full-time employees starting a side business have different risk profiles and timelines than people going all-in. Your brief will be calibrated accordingly.',
    options: ['Employed full-time, starting on the side', 'Left/leaving employment to focus on this', 'Already self-employed', 'Student', 'Between roles'],
  },
  revenue: {
    label: 'Estimated first-year revenue?',
    hint: 'The £90,000 VAT threshold is a major compliance trigger. If you\'re approaching it, your brief will warn you 90 days in advance — missing it means automatic penalties.',
    options: ['Under £30,000', '£30,000 – £90,000', 'Over £90,000', 'Not sure yet'],
  },
  hiring: {
    label: 'Do you plan to hire anyone in year one?',
    hint: 'Your first employee triggers Real Time Information (RTI) PAYE filing every payroll. Missing even one RTI submission incurs automatic HMRC penalties starting at £100.',
    options: ['Just me for now', '1–2 people (contractors or employees)', '3 or more people', 'Not decided yet'],
  },
};

// GROWTH: 4 questions — each directly changes which compliance alerts and KPIs appear
// Sources: FSB Small Business Index Q4 2024 (cash flow #1 concern, labour costs #2),
// HMRC Making Tax Digital mandate, ICAEW accountant onboarding research,
// British Business Bank late payment data (avg SMB owed £23,360 in late payments)
const GROWTH_Q = {
  employees: {
    label: 'How many people work in your business?',
    hint: 'Employee count changes your compliance obligations dramatically — PAYE/RTI filing, auto-enrolment pension, health & safety assessments, and P60 issuance. We only surface the deadlines that apply to you.',
    options: ['Just me', '1–2 people', '3–10 people', '11–50 people', '50+ people'],
  },
  accountant: {
    label: 'Do you work with an accountant?',
    hint: 'If you have an accountant, your brief focuses on strategic decisions and flags issues to raise with them. If you\'re doing it yourself, we give you the detail you need to stay compliant without missing anything.',
    options: ['Yes, I have a dedicated accountant', 'I use accounting software (Xero, QuickBooks, FreeAgent)', 'No — I manage it manually', 'Looking for one'],
  },
  invoices: {
    label: 'How much are clients currently owing you?',
    hint: 'UK SMBs are owed an average of £23,360 in late payments (FSB 2024). If you have outstanding invoices, your brief will track them and draft chase emails automatically.',
    options: ['Nothing outstanding', 'Under £5,000', '£5,000 – £20,000', 'Over £20,000'],
  },
  mtd: {
    label: 'Are you on Making Tax Digital (MTD)?',
    hint: 'MTD is mandatory for VAT-registered businesses over £90k. Non-compliant digital record keeping carries penalties. If you\'re not sure, your brief will explain exactly what applies to you.',
    options: ['Yes, fully set up', 'Partially — still sorting my software', 'No / Not applicable', 'What is MTD?'],
  },
};

// EXECUTIVE: 4 questions based on EOS/Traction framework, McKinsey CEO research,
// and Working Capital management studies. CEOs reviewing daily cash + weekly revenue
// make course corrections 3–4 weeks faster than monthly reviewers (Klipfolio research).
const EXEC_Q = {
  directReports: {
    label: 'How many people report directly to you?',
    hint: 'Org structure determines briefing style. A CEO with a CFO gets a headline executive summary. Without a CFO, you need financial detail merged with strategic context. We calibrate accordingly.',
    options: ['1–3 (wearing multiple hats)', '4–8 (small leadership team)', '9–15 (established team)', '15+ (large organisation)'],
  },
  strategy: {
    label: 'What is your current strategic priority?',
    hint: 'Growth-mode briefings track pipeline, burn, and acquisition. Optimisation briefings track margin, cost structure, and efficiency. Your brief opens with your primary lens every morning.',
    options: ['Revenue growth / market expansion', 'Profitability and margin optimisation', 'New product / service launch', 'Acquisition or merger', 'Steady state — consolidating what we have'],
  },
  kpi: {
    label: 'What is the one number you watch most closely?',
    hint: 'From Gino Wickman\'s EOS framework: every well-run business has a "scorecard number" — the single metric that, if it moves, tells you everything about business health. Your brief leads with this.',
    options: ['Revenue / monthly recurring revenue', 'Gross margin or profit', 'Cash position and runway', 'Customer retention / churn', 'Pipeline value or sales conversion', 'Team utilisation / capacity'],
  },
  decision: {
    label: 'What is your biggest decision in the next 90 days?',
    hint: 'Free text — this is what we use to make your brief genuinely different from everything else. Your brief will proactively surface relevant data, risks, and intelligence for this specific decision.',
    type: 'textarea',
    placeholder: 'e.g. Whether to hire a Head of Sales, expand to a second location, raise a funding round, or exit...',
  },
};

/* ─── UI primitives ───────────────────────────────────────────────────────── */

function ProgressBar({ step, total }) {
  return (
    <div className="flex items-center gap-1.5 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="h-0.5 rounded-full flex-1 transition-all duration-500"
          style={{ background: i < step ? '#2563EB' : 'rgba(255,255,255,0.1)' }} />
      ))}
    </div>
  );
}

function PillSelect({ options, value, onChange, colour }) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {options.map(opt => {
        const active = value === opt;
        return (
          <button key={opt} type="button" onClick={() => onChange(opt)}
            className="px-3.5 py-2 rounded-full text-sm font-medium transition-all text-left"
            style={{
              background: active ? colour : 'rgba(255,255,255,0.04)',
              color: active ? '#fff' : 'rgba(255,255,255,0.45)',
              border: `1px solid ${active ? colour : 'rgba(255,255,255,0.1)'}`,
            }}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function QuestionBlock({ label, hint, children }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <p className="text-sm font-bold text-white mb-1">{label}</p>
      <p className="text-xs mb-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>{hint}</p>
      {children}
    </div>
  );
}

function DarkInput({ accentColour = '#2563EB', ...props }) {
  return (
    <input {...props}
      className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none transition-all"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
      onFocus={e => (e.currentTarget.style.borderColor = accentColour)}
      onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')} />
  );
}

/* ─── Main component ──────────────────────────────────────────────────────── */
export default function MorningBrief() {
  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Step 1
  const [segment, setSegment] = useState('');
  // Step 2
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');

  // Step 3 — Aspiring
  const [structure,  setStructure]  = useState('');
  const [employment, setEmployment] = useState('');
  const [revenue,    setRevenue]    = useState('');
  const [hiring,     setHiring]     = useState('');

  // Step 3 — Growth
  const [vatRegistered,  setVatRegistered]  = useState('');
  const [lastVatReturn,  setLastVatReturn]  = useState('');
  const [yearEndMonth,   setYearEndMonth]   = useState('');
  const [employees,      setEmployees]      = useState('');
  const [accountant,     setAccountant]     = useState('');
  const [invoices,       setInvoices]       = useState('');
  const [mtd,            setMtd]            = useState('');

  // Step 3 — Executive
  const [directReports, setDirectReports] = useState('');
  const [strategy,      setStrategy]      = useState('');
  const [kpi,           setKpi]           = useState('');
  const [bigDecision,   setBigDecision]   = useState('');
  const [companySize,   setCompanySize]   = useState('');

  useEffect(() => { document.title = 'Morning Brief — Vpayit'; }, []);

  const seg = SEGMENTS.find(s => s.id === segment);
  const accent = seg?.colour || '#2563EB';

  const step3Valid = () => {
    if (segment === 'aspiring')  return structure && employment && revenue && hiring;
    if (segment === 'growth')    return employees && accountant && invoices && mtd;
    if (segment === 'executive') return directReports && strategy && kpi;
    return false;
  };

  async function handleSubmit() {
    setLoading(true);
    setError('');
    const payload = {
      name, email,
      company_name: company || 'Pre-formation',
      business_type: 'ltd',
      business_stage: segment,
      industry,
      // aspiring
      business_structure: structure || null,
      employment_status:  employment || null,
      expected_revenue:   segment === 'aspiring' ? revenue : null,
      plan_to_hire:       hiring || null,
      // growth
      vat_registered:     vatRegistered === 'Yes',
      last_vat_return:    lastVatReturn || null,
      year_end_month:     yearEndMonth ? ['January','February','March','April','May','June','July','August','September','October','November','December'].indexOf(yearEndMonth) + 1 : null,
      employee_count:     employees || null,
      has_accountant:     accountant || null,
      outstanding_invoices: invoices || null,
      on_making_tax_digital: mtd ? mtd.startsWith('Yes') : null,
      monthly_revenue:    segment === 'growth' ? revenue : null,
      // executive
      direct_reports:     directReports || null,
      growth_strategy:    strategy || null,
      primary_kpi:        kpi || null,
      biggest_decision:   bigDecision || null,
      company_size:       companySize || null,
      role:               null,
    };

    try {
      const res  = await fetch(`${API}/brief/subscribe`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong.'); setLoading(false); return; }
      setStep(4);
    } catch {
      setError('Could not connect. Please try again.');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#080808', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Glow */}
      <div className="pointer-events-none absolute" style={{
        top: '-20%', left: '50%', transform: 'translateX(-50%)',
        width: '800px', height: '500px',
        background: `radial-gradient(ellipse at center, ${seg?.glow || 'rgba(37,99,235,0.12)'} 0%, transparent 70%)`,
        filter: 'blur(40px)', transition: 'background 0.8s ease',
      }} />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 h-16" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="font-extrabold text-lg text-white" style={{ letterSpacing: '-0.5px' }}>Vpayit</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(37,99,235,0.2)', color: '#93C5FD', border: '1px solid rgba(37,99,235,0.3)' }}>AI</span>
        </Link>
        <Link to="/auth/login" className="text-sm font-medium no-underline" style={{ color: 'rgba(255,255,255,0.3)' }}>Sign in</Link>
      </nav>

      <div className="relative z-10 max-w-xl mx-auto px-6 pt-14 pb-24">

        {/* ── Step 1: Segment ── */}
        {step === 1 && (
          <div>
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold" style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', color: '#93C5FD' }}>
                <Sparkles className="w-3.5 h-3.5" /> Free · Personalised to your stage
              </div>
            </div>
            <h1 className="text-center font-extrabold text-white mb-2" style={{ fontSize: 'clamp(1.75rem, 5vw, 2.75rem)', letterSpacing: '-1.5px', lineHeight: 1.1 }}>
              Where are you on your
              <span className="block italic mt-1" style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, color: 'rgba(255,255,255,0.45)' }}>business journey?</span>
            </h1>
            <p className="text-center text-sm mb-8" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Your brief is built around your stage — not a generic template.
            </p>
            <div className="space-y-3 mb-8">
              {SEGMENTS.map(s => {
                const Icon = s.icon;
                const active = segment === s.id;
                return (
                  <button key={s.id} type="button" onClick={() => setSegment(s.id)}
                    className="w-full flex items-center gap-4 p-5 rounded-2xl text-left transition-all"
                    style={{ background: active ? s.glow : 'rgba(255,255,255,0.03)', border: `1px solid ${active ? s.colour : 'rgba(255,255,255,0.08)'}` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: active ? s.colour : 'rgba(255,255,255,0.06)' }}>
                      <Icon className="w-5 h-5" style={{ color: active ? '#fff' : 'rgba(255,255,255,0.4)' }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-white">{s.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.subtitle}</p>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                      style={{ borderColor: active ? s.colour : 'rgba(255,255,255,0.15)', background: active ? s.colour : 'transparent' }}>
                      {active && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
            <button onClick={() => segment && setStep(2)} disabled={!segment}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-25"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}bb)` }}>
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Step 2: Basic info ── */}
        {step === 2 && (
          <div>
            <ProgressBar step={1} total={3} />
            <h2 className="text-2xl font-extrabold text-white mb-1" style={{ letterSpacing: '-0.5px' }}>About you</h2>
            <p className="text-sm mb-7" style={{ color: 'rgba(255,255,255,0.3)' }}>How we address you and personalise your brief.</p>
            <div className="space-y-4">
              {[
                { label: 'Your name', state: name, set: setName, placeholder: 'e.g. Venkat Srinivas', type: 'text' },
                { label: 'Work email', state: email, set: setEmail, placeholder: 'you@yourcompany.co.uk', type: 'email' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>{f.label}</label>
                  <DarkInput accentColour={accent} type={f.type} placeholder={f.placeholder} value={f.state} onChange={e => f.set(e.target.value)} required />
                </div>
              ))}
              {segment !== 'aspiring' && (
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Company name</label>
                  <DarkInput accentColour={accent} placeholder="e.g. Vpayit Ltd" value={company} onChange={e => setCompany(e.target.value)} />
                </div>
              )}
              {segment === 'aspiring' && (
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Your business idea (brief description)</label>
                  <textarea placeholder="e.g. An AI tool that helps UK freelancers track their invoices and tax..."
                    value={company} onChange={e => setCompany(e.target.value)} rows={3}
                    className="w-full px-4 py-3 rounded-xl text-sm text-white focus:outline-none transition-all resize-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onFocus={e => (e.currentTarget.style.borderColor = accent)}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')} />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Industry</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {INDUSTRIES.map(ind => (
                    <button key={ind} type="button" onClick={() => setIndustry(ind)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                      style={{ background: industry === ind ? accent : 'rgba(255,255,255,0.04)', color: industry === ind ? '#fff' : 'rgba(255,255,255,0.4)', border: `1px solid ${industry === ind ? accent : 'rgba(255,255,255,0.1)'}` }}>
                      {ind}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-7">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button onClick={() => (name && email && industry) && setStep(3)} disabled={!name || !email || !industry}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-25"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent}bb)` }}>
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3A: Aspiring questions ── */}
        {step === 3 && segment === 'aspiring' && (
          <div>
            <ProgressBar step={2} total={3} />
            <h2 className="text-2xl font-extrabold text-white mb-1" style={{ letterSpacing: '-0.5px' }}>Your launch profile</h2>
            <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
              4 questions. Each one changes what your brief tells you — not decoration.
            </p>
            <div className="space-y-4">
              <QuestionBlock label={ASPIRING_Q.structure.label} hint={ASPIRING_Q.structure.hint}>
                <PillSelect options={ASPIRING_Q.structure.options} value={structure} onChange={setStructure} colour={accent} />
              </QuestionBlock>
              <QuestionBlock label={ASPIRING_Q.employment.label} hint={ASPIRING_Q.employment.hint}>
                <PillSelect options={ASPIRING_Q.employment.options} value={employment} onChange={setEmployment} colour={accent} />
              </QuestionBlock>
              <QuestionBlock label={ASPIRING_Q.revenue.label} hint={ASPIRING_Q.revenue.hint}>
                <PillSelect options={ASPIRING_Q.revenue.options} value={revenue} onChange={setRevenue} colour={accent} />
              </QuestionBlock>
              <QuestionBlock label={ASPIRING_Q.hiring.label} hint={ASPIRING_Q.hiring.hint}>
                <PillSelect options={ASPIRING_Q.hiring.options} value={hiring} onChange={setHiring} colour={accent} />
              </QuestionBlock>
            </div>
            {error && <p className="mt-4 text-sm px-4 py-3 rounded-xl" style={{ background: 'rgba(220,38,38,0.1)', color: '#FCA5A5', border: '1px solid rgba(220,38,38,0.2)' }}>{error}</p>}
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(2)} className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button onClick={handleSubmit} disabled={loading || !step3Valid()}
                className="flex-1 py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-25"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent}bb)` }}>
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Setting up…</> : <>Start my free brief <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3B: Growth questions ── */}
        {step === 3 && segment === 'growth' && (
          <div>
            <ProgressBar step={2} total={3} />
            <h2 className="text-2xl font-extrabold text-white mb-1" style={{ letterSpacing: '-0.5px' }}>Your business profile</h2>
            <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
              4 questions that determine which deadlines, risks, and KPIs appear in your brief.
            </p>
            <div className="space-y-4">
              <QuestionBlock label={GROWTH_Q.employees.label} hint={GROWTH_Q.employees.hint}>
                <PillSelect options={GROWTH_Q.employees.options} value={employees} onChange={setEmployees} colour={accent} />
              </QuestionBlock>

              {/* VAT inline */}
              <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-sm font-bold text-white mb-1">VAT status</p>
                <p className="text-xs mb-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Your VAT return dates are calculated precisely from your last filing — not guessed. This is how we tell you "31 days left" not just "quarterly".
                </p>
                <PillSelect options={['Yes, VAT registered', 'No, not yet', 'Approaching the threshold']} value={vatRegistered} onChange={setVatRegistered} colour={accent} />
                {vatRegistered === 'Yes, VAT registered' && (
                  <div className="mt-3">
                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Last VAT return filed</label>
                    <input type="month" value={lastVatReturn} onChange={e => setLastVatReturn(e.target.value)}
                      className="px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                      onFocus={e => (e.currentTarget.style.borderColor = accent)}
                      onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')} />
                  </div>
                )}
                <div className="mt-3">
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Company year-end month</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                      <button key={m} type="button" onClick={() => setYearEndMonth(['January','February','March','April','May','June','July','August','September','October','November','December'][i])}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{ background: yearEndMonth === ['January','February','March','April','May','June','July','August','September','October','November','December'][i] ? accent : 'rgba(255,255,255,0.05)', color: yearEndMonth === ['January','February','March','April','May','June','July','August','September','October','November','December'][i] ? '#fff' : 'rgba(255,255,255,0.35)', border: `1px solid rgba(255,255,255,0.08)` }}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <QuestionBlock label={GROWTH_Q.accountant.label} hint={GROWTH_Q.accountant.hint}>
                <PillSelect options={GROWTH_Q.accountant.options} value={accountant} onChange={setAccountant} colour={accent} />
              </QuestionBlock>
              <QuestionBlock label={GROWTH_Q.invoices.label} hint={GROWTH_Q.invoices.hint}>
                <PillSelect options={GROWTH_Q.invoices.options} value={invoices} onChange={setInvoices} colour={accent} />
              </QuestionBlock>
              <QuestionBlock label={GROWTH_Q.mtd.label} hint={GROWTH_Q.mtd.hint}>
                <PillSelect options={GROWTH_Q.mtd.options} value={mtd} onChange={setMtd} colour={accent} />
              </QuestionBlock>
            </div>
            {error && <p className="mt-4 text-sm px-4 py-3 rounded-xl" style={{ background: 'rgba(220,38,38,0.1)', color: '#FCA5A5', border: '1px solid rgba(220,38,38,0.2)' }}>{error}</p>}
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(2)} className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button onClick={handleSubmit} disabled={loading || !step3Valid()}
                className="flex-1 py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-25"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent}bb)` }}>
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Setting up…</> : <>Start my free brief <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3C: Executive questions ── */}
        {step === 3 && segment === 'executive' && (
          <div>
            <ProgressBar step={2} total={3} />
            <h2 className="text-2xl font-extrabold text-white mb-1" style={{ letterSpacing: '-0.5px' }}>Your leadership profile</h2>
            <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Based on EOS/Traction and McKinsey CEO research — the questions that actually change your brief.
            </p>
            <div className="space-y-4">
              <QuestionBlock label={EXEC_Q.directReports.label} hint={EXEC_Q.directReports.hint}>
                <PillSelect options={EXEC_Q.directReports.options} value={directReports} onChange={setDirectReports} colour={accent} />
              </QuestionBlock>
              <QuestionBlock label={EXEC_Q.strategy.label} hint={EXEC_Q.strategy.hint}>
                <PillSelect options={EXEC_Q.strategy.options} value={strategy} onChange={setStrategy} colour={accent} />
              </QuestionBlock>
              <QuestionBlock label={EXEC_Q.kpi.label} hint={EXEC_Q.kpi.hint}>
                <PillSelect options={EXEC_Q.kpi.options} value={kpi} onChange={setKpi} colour={accent} />
              </QuestionBlock>
              <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-sm font-bold text-white mb-1">{EXEC_Q.decision.label}</p>
                <p className="text-xs mb-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>{EXEC_Q.decision.hint}</p>
                <textarea placeholder={EXEC_Q.decision.placeholder} value={bigDecision} onChange={e => setBigDecision(e.target.value)} rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white focus:outline-none transition-all resize-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onFocus={e => (e.currentTarget.style.borderColor = accent)}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')} />
              </div>
            </div>
            {error && <p className="mt-4 text-sm px-4 py-3 rounded-xl" style={{ background: 'rgba(220,38,38,0.1)', color: '#FCA5A5', border: '1px solid rgba(220,38,38,0.2)' }}>{error}</p>}
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(2)} className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button onClick={handleSubmit} disabled={loading || !step3Valid()}
                className="flex-1 py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-25"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent}bb)` }}>
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Setting up…</> : <>Start my free brief <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Success ── */}
        {step === 4 && (
          <div className="text-center pt-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: seg?.glow, border: `1px solid ${accent}40` }}>
              <Check className="w-8 h-8" style={{ color: accent }} />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-3" style={{ letterSpacing: '-1px' }}>You're in.</h2>
            <p className="text-sm leading-relaxed mb-1" style={{ color: 'rgba(255,255,255,0.4)', maxWidth: '340px', margin: '0 auto 6px' }}>
              Your first brief lands tomorrow at 8am — built for your specific stage, industry, and answers.
            </p>
            <p className="text-xs mb-8" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Add <span style={{ color: '#93C5FD' }}>hello@vpayit.co.uk</span> to contacts so it doesn't hit spam.
            </p>
            <div className="rounded-2xl p-5 text-left mb-8" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>What makes your brief different</p>
              {segment === 'aspiring' && ['UK structure recommendation based on your idea and industry', 'Companies House registration walkthrough, step by step', 'VAT threshold warning built to your revenue forecast', hiring && hiring !== 'Just me for now' ? 'RTI/PAYE setup guide triggered by your hiring plans' : 'Solo operator compliance — simplified, nothing irrelevant'].map(i => (
                <div key={i} className="flex items-start gap-2.5 text-sm py-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: accent }} /> {i}
                </div>
              ))}
              {segment === 'growth' && ['Your exact VAT deadline calculated from your last return', yearEndMonth ? `Corporation Tax deadline: 9 months after your ${yearEndMonth} year-end` : 'Corporation Tax deadline calculated from your year-end', accountant?.startsWith('Yes') ? 'Strategic decision focus — your accountant handles the filings' : 'Full compliance detail since you\'re managing it yourself', invoices && invoices !== 'Nothing outstanding' ? `Invoice chase tracking for your ${invoices} outstanding` : 'Clean invoice tracking from day one'].map(i => (
                <div key={i} className="flex items-start gap-2.5 text-sm py-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: accent }} /> {i}
                </div>
              ))}
              {segment === 'executive' && ['Executive summary format — no detail you already have', strategy ? `${strategy} lens applied to every brief` : 'Strategic briefing calibrated to your priorities', kpi ? `Opens with your primary metric: ${kpi}` : 'Leads with the KPI you said matters most', bigDecision ? 'Intelligence and risk flags for your 90-day decision' : 'Strategic risk and opportunity briefing'].map(i => (
                <div key={i} className="flex items-start gap-2.5 text-sm py-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: accent }} /> {i}
                </div>
              ))}
            </div>
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold no-underline" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Back to home <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      <footer className="relative z-10 px-8 py-6 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="font-bold text-sm text-white">Vpayit</span>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>© {new Date().getFullYear()} Vpayit Ltd · Your AI Chief of Staff</p>
      </footer>
    </div>
  );
}
