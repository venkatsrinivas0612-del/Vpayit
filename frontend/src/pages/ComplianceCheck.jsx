import { useState, useEffect } from 'react';
import { CheckCircle2, ArrowRight, ArrowLeft, AlertTriangle, Shield } from 'lucide-react';

/* ─── Date helpers (same as Compliance.jsx) ───────────────────────────────── */

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function daysUntil(date) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return Math.round((d - now) / (1000 * 60 * 60 * 24));
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/* ─── Compliance calculator ───────────────────────────────────────────────── */

function calcDeadlines({ incorporationDate, vatRegistered, hasEmployees }) {
  const incDate = new Date(incorporationDate);
  const deadlines = [];

  const confDue = addDays(addMonths(incDate, 12), 14);
  deadlines.push({
    id: 'conf',
    label: 'Confirmation Statement',
    due: confDue,
    desc: 'Annual snapshot of your company filed with Companies House.',
    fee: '£34 filing fee',
  });

  const fyEnd = new Date(incDate);
  fyEnd.setFullYear(fyEnd.getFullYear() + 1);
  fyEnd.setDate(fyEnd.getDate() - 1);

  deadlines.push({
    id: 'accounts',
    label: 'Annual Accounts',
    due: addMonths(incDate, 21),
    desc: 'Statutory accounts filed with Companies House.',
    fee: 'Accountant fee: £400–£1,500',
  });

  deadlines.push({
    id: 'ctpay',
    label: 'Corporation Tax Payment',
    due: addDays(addMonths(fyEnd, 9), 1),
    desc: 'Pay your Corporation Tax bill to HMRC.',
    fee: '19–25% of profits',
  });

  deadlines.push({
    id: 'ct600',
    label: 'Corporation Tax Return (CT600)',
    due: addMonths(fyEnd, 12),
    desc: 'File your CT600 return with HMRC.',
    fee: 'Accountant fee (often bundled)',
  });

  if (vatRegistered) {
    const now = new Date();
    const month = now.getMonth();
    let vatDue;
    if (month < 3)      vatDue = new Date(now.getFullYear(), 4,  7);
    else if (month < 6) vatDue = new Date(now.getFullYear(), 7,  7);
    else if (month < 9) vatDue = new Date(now.getFullYear(), 10, 7);
    else                vatDue = new Date(now.getFullYear() + 1, 1, 7);
    deadlines.push({
      id: 'vat',
      label: 'VAT Return',
      due: vatDue,
      desc: 'Quarterly VAT return under Making Tax Digital.',
      fee: 'Net VAT owed',
    });
  }

  if (hasEmployees) {
    const now = new Date();
    const payeMonth = new Date(now.getFullYear(), now.getMonth() + 1, 19);
    deadlines.push({
      id: 'paye',
      label: 'PAYE Payment',
      due: payeMonth,
      desc: 'Monthly PAYE and NI payment to HMRC.',
      fee: 'Employer NI: 13.8% above threshold',
    });
  }

  deadlines.sort((a, b) => new Date(a.due) - new Date(b.due));
  return deadlines;
}

/* ─── Questions config ────────────────────────────────────────────────────── */

const STAGES = [
  { value: 'thinking',     label: 'Thinking of starting a business' },
  { value: 'just_formed',  label: 'Just incorporated my company'    },
  { value: 'trading',      label: 'Already trading'                 },
  { value: 'established',  label: 'Established business (1+ years)' },
];

const BUSINESS_TYPES = [
  { value: 'limited',      label: 'Limited Company (Ltd)'           },
  { value: 'sole_trader',  label: 'Sole Trader'                     },
  { value: 'partnership',  label: 'Partnership'                     },
  { value: 'llp',          label: 'Limited Liability Partnership'   },
];

const INDUSTRIES = [
  'Technology & Software',
  'Professional Services',
  'Retail & E-commerce',
  'Construction & Trades',
  'Hospitality & Food',
  'Health & Wellbeing',
  'Creative & Media',
  'Finance & Consulting',
  'Other',
];

/* ─── Progress bar ────────────────────────────────────────────────────────── */

function ProgressBar({ step, total }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-xs font-semibold"
          style={{ color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Step {step} of {total}
        </span>
        <span
          className="text-xs font-semibold"
          style={{ color: '#2563EB', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {Math.round((step / total) * 100)}%
        </span>
      </div>
      <div className="h-1.5 rounded-full w-full" style={{ background: '#F0EDE8' }}>
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${(step / total) * 100}%`, background: '#2563EB' }}
        />
      </div>
    </div>
  );
}

/* ─── Status badge ────────────────────────────────────────────────────────── */

function StatusBadge({ days }) {
  if (days < 0)   return <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#FEE2E2', color: '#DC2626', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>OVERDUE</span>;
  if (days <= 30) return <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: '#D97706', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{days} days</span>;
  if (days <= 90) return <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#EEF2FF', color: '#2563EB', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{days} days</span>;
  return <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#DCFCE7', color: '#16A34A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{days} days</span>;
}

/* ─── Results screen ──────────────────────────────────────────────────────── */

function Results({ form, deadlines, onReset }) {
  const [emailForm, setEmailForm] = useState({ name: '', email: '', company: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
  const urgent = deadlines.filter(d => daysUntil(d.due) <= 30);

  async function handleSubscribe(e) {
    e.preventDefault();
    if (!emailForm.name.trim() || !emailForm.email.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/v1/brief/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:           emailForm.name,
          email:          emailForm.email,
          company_name:   emailForm.company || 'Not provided',
          business_type:  form.businessType,
          business_stage: form.stage,
          vat_registered: form.vatRegistered,
          employee_count: form.hasEmployees ? '1+' : '0',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
      } else {
        setSubmitted(true);
      }
    } catch {
      setError('Could not connect. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#FEFDFB' }}>
      {/* Top bar */}
      <div
        className="px-6 py-4 border-b"
        style={{ background: '#FEFDFB', borderColor: '#E8E6E1' }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <span
            className="font-extrabold text-lg tracking-tight"
            style={{ color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Vpayit <span className="text-xs font-semibold px-2 py-0.5 rounded-full ml-1" style={{ background: '#EEF2FF', color: '#2563EB' }}>AI</span>
          </span>
          <button
            onClick={onReset}
            className="text-xs font-semibold flex items-center gap-1"
            style={{ color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <ArrowLeft className="w-3 h-3" /> Start over
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-1"
            style={{ color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Your personalised compliance roadmap
          </p>
          <h1
            className="text-2xl font-bold"
            style={{ color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.5px' }}
          >
            {deadlines.length} deadlines to track this year
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: '#6B7280', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Based on your answers. Sorted by urgency.
          </p>
        </div>

        {/* Urgent alert */}
        {urgent.length > 0 && (
          <div
            className="rounded-2xl border p-5"
            style={{ background: '#FFF7ED', borderColor: '#FED7AA' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4" style={{ color: '#D97706' }} />
              <p
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: '#D97706', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Urgent — action needed now
              </p>
            </div>
            {urgent.map(d => (
              <p
                key={d.id}
                className="text-sm"
                style={{ color: '#92400E', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                · {d.label} — due {formatDate(d.due)} ({daysUntil(d.due)} days)
              </p>
            ))}
          </div>
        )}

        {/* Deadline list */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: '#FFFFFF', borderColor: '#E8E6E1' }}
        >
          <div className="divide-y" style={{ borderColor: '#F0EDE8' }}>
            {deadlines.map(d => {
              const days = daysUntil(d.due);
              return (
                <div key={d.id} className="px-6 py-4 flex items-start gap-4">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5"
                    style={{
                      background:
                        days < 0    ? '#DC2626' :
                        days <= 30  ? '#D97706' :
                        days <= 90  ? '#2563EB' : '#16A34A',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-0.5">
                      <p
                        className="text-sm font-bold"
                        style={{ color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        {d.label}
                      </p>
                      <StatusBadge days={days} />
                    </div>
                    <p
                      className="text-xs"
                      style={{ color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      Due {formatDate(d.due)} · {d.fee}
                    </p>
                    <p
                      className="text-sm mt-1"
                      style={{ color: '#555', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      {d.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Email capture */}
        <div
          className="rounded-2xl border p-7"
          style={{ background: '#FFFFFF', borderColor: '#E8E6E1' }}
        >
          {submitted ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3" style={{ color: '#16A34A' }} />
              <h3
                className="text-lg font-bold mb-1"
                style={{ color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                You're in!
              </h3>
              <p
                className="text-sm"
                style={{ color: '#6B7280', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Your first morning brief arrives tomorrow at 8am. Check your inbox.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4" style={{ color: '#2563EB' }} />
                <p
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Get this as your daily brief — free
                </p>
              </div>
              <h3
                className="text-lg font-bold mb-1"
                style={{ color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.3px' }}
              >
                Never miss a UK deadline again
              </h3>
              <p
                className="text-sm mb-5"
                style={{ color: '#6B7280', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Vpayit sends a personalised morning brief every day at 8am — your compliance status, cash position, and what needs your attention. Free, forever.
              </p>

              <form onSubmit={handleSubscribe} className="space-y-3">
                <input
                  type="text"
                  placeholder="Your name"
                  value={emailForm.name}
                  onChange={e => setEmailForm(f => ({ ...f, name: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: '#E8E6E1', background: '#FEFDFB', color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                />
                <input
                  type="text"
                  placeholder="Company name (optional)"
                  value={emailForm.company}
                  onChange={e => setEmailForm(f => ({ ...f, company: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: '#E8E6E1', background: '#FEFDFB', color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                />
                <input
                  type="email"
                  placeholder="Work email address"
                  value={emailForm.email}
                  onChange={e => setEmailForm(f => ({ ...f, email: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: '#E8E6E1', background: '#FEFDFB', color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                />

                {error && (
                  <p
                    className="text-sm px-4 py-2 rounded-xl border"
                    style={{ color: '#DC2626', background: '#FEF2F2', borderColor: '#FCA5A5', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting || !emailForm.name.trim() || !emailForm.email.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-40"
                  style={{ background: '#2563EB', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {submitting ? 'Signing up…' : 'Get my free morning brief'}
                  {!submitting && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              <p
                className="text-xs text-center mt-3"
                style={{ color: '#C4BFB8', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                No spam. Unsubscribe any time. We never share your data.
              </p>
            </>
          )}
        </div>

        <p
          className="text-xs text-center pb-4"
          style={{ color: '#C4BFB8', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Deadlines are calculated from Companies House and HMRC rules. Always confirm with a qualified accountant.
          &nbsp;·&nbsp;<a href="https://vpayit.co.uk" style={{ color: '#C4BFB8', textDecoration: 'underline' }}>vpayit.co.uk</a>
        </p>
      </div>
    </div>
  );
}

/* ─── Wizard ──────────────────────────────────────────────────────────────── */

const TOTAL_STEPS = 5;

export default function ComplianceCheck() {
  const [step, setStep]   = useState(1);
  const [form, setForm]   = useState({
    stage:              '',
    businessType:       'limited',
    vatRegistered:      false,
    hasEmployees:       false,
    incorporationDate:  '',
  });
  const [deadlines, setDeadlines] = useState([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    document.title = 'UK Compliance Checker — Vpayit';
  }, []);

  function next() {
    if (step < TOTAL_STEPS) setStep(s => s + 1);
    else handleGenerate();
  }

  function back() {
    if (step > 1) setStep(s => s - 1);
  }

  function handleGenerate() {
    // If no date provided, default to 12 months ago
    const date = form.incorporationDate || (() => {
      const d = new Date();
      d.setFullYear(d.getFullYear() - 1);
      return d.toISOString().split('T')[0];
    })();
    const d = calcDeadlines({ ...form, incorporationDate: date });
    setDeadlines(d);
    setShowResults(true);
  }

  if (showResults) {
    return (
      <Results
        form={form}
        deadlines={deadlines}
        onReset={() => { setStep(1); setShowResults(false); setForm({ stage: '', businessType: 'limited', vatRegistered: false, hasEmployees: false, incorporationDate: '' }); }}
      />
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#FEFDFB' }}>
      {/* Top bar */}
      <div
        className="px-6 py-4 border-b"
        style={{ background: '#FEFDFB', borderColor: '#E8E6E1' }}
      >
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <span
            className="font-extrabold text-lg tracking-tight"
            style={{ color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Vpayit <span className="text-xs font-semibold px-2 py-0.5 rounded-full ml-1" style={{ background: '#EEF2FF', color: '#2563EB' }}>AI</span>
          </span>
          <a
            href="https://vpayit.co.uk"
            className="text-xs font-semibold"
            style={{ color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Back to vpayit.co.uk
          </a>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 py-10">
        <ProgressBar step={step} total={TOTAL_STEPS} />

        {/* ── Step 1: Business stage ── */}
        {step === 1 && (
          <div>
            <h2
              className="text-xl font-bold mb-1"
              style={{ color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.3px' }}
            >
              Where are you in your business journey?
            </h2>
            <p
              className="text-sm mb-6"
              style={{ color: '#6B7280', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              This helps us personalise your compliance roadmap.
            </p>
            <div className="space-y-3">
              {STAGES.map(s => (
                <button
                  key={s.value}
                  onClick={() => { setForm(f => ({ ...f, stage: s.value })); }}
                  className="w-full text-left px-5 py-4 rounded-xl border transition-all"
                  style={{
                    borderColor: form.stage === s.value ? '#2563EB' : '#E8E6E1',
                    background:  form.stage === s.value ? '#EEF2FF' : '#FFFFFF',
                    color:       form.stage === s.value ? '#2563EB' : '#111',
                    fontFamily:  "'Plus Jakarta Sans', sans-serif",
                    fontSize:    '14px',
                    fontWeight:  form.stage === s.value ? 600 : 400,
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Business type ── */}
        {step === 2 && (
          <div>
            <h2
              className="text-xl font-bold mb-1"
              style={{ color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.3px' }}
            >
              What type of business do you have?
            </h2>
            <p
              className="text-sm mb-6"
              style={{ color: '#6B7280', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              This determines which filings apply to you.
            </p>
            <div className="space-y-3">
              {BUSINESS_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setForm(f => ({ ...f, businessType: t.value }))}
                  className="w-full text-left px-5 py-4 rounded-xl border transition-all"
                  style={{
                    borderColor: form.businessType === t.value ? '#2563EB' : '#E8E6E1',
                    background:  form.businessType === t.value ? '#EEF2FF' : '#FFFFFF',
                    color:       form.businessType === t.value ? '#2563EB' : '#111',
                    fontFamily:  "'Plus Jakarta Sans', sans-serif",
                    fontSize:    '14px',
                    fontWeight:  form.businessType === t.value ? 600 : 400,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 3: VAT ── */}
        {step === 3 && (
          <div>
            <h2
              className="text-xl font-bold mb-1"
              style={{ color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.3px' }}
            >
              Are you VAT registered?
            </h2>
            <p
              className="text-sm mb-6"
              style={{ color: '#6B7280', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              You must register if your VAT-taxable turnover exceeds £90,000 in any 12-month period.
            </p>
            <div className="space-y-3">
              {[
                { label: 'Yes — I have a VAT registration number',           value: true  },
                { label: 'No — I\'m below the threshold or not registered',  value: false },
              ].map(opt => (
                <button
                  key={String(opt.value)}
                  onClick={() => setForm(f => ({ ...f, vatRegistered: opt.value }))}
                  className="w-full text-left px-5 py-4 rounded-xl border transition-all"
                  style={{
                    borderColor: form.vatRegistered === opt.value ? '#2563EB' : '#E8E6E1',
                    background:  form.vatRegistered === opt.value ? '#EEF2FF' : '#FFFFFF',
                    color:       form.vatRegistered === opt.value ? '#2563EB' : '#111',
                    fontFamily:  "'Plus Jakarta Sans', sans-serif",
                    fontSize:    '14px',
                    fontWeight:  form.vatRegistered === opt.value ? 600 : 400,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 4: Employees ── */}
        {step === 4 && (
          <div>
            <h2
              className="text-xl font-bold mb-1"
              style={{ color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.3px' }}
            >
              Do you have employees on payroll?
            </h2>
            <p
              className="text-sm mb-6"
              style={{ color: '#6B7280', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              This includes part-time employees, but not self-employed contractors you pay separately.
            </p>
            <div className="space-y-3">
              {[
                { label: 'Yes — I run payroll each month',     value: true  },
                { label: 'No — just myself as a director',     value: false },
              ].map(opt => (
                <button
                  key={String(opt.value)}
                  onClick={() => setForm(f => ({ ...f, hasEmployees: opt.value }))}
                  className="w-full text-left px-5 py-4 rounded-xl border transition-all"
                  style={{
                    borderColor: form.hasEmployees === opt.value ? '#2563EB' : '#E8E6E1',
                    background:  form.hasEmployees === opt.value ? '#EEF2FF' : '#FFFFFF',
                    color:       form.hasEmployees === opt.value ? '#2563EB' : '#111',
                    fontFamily:  "'Plus Jakarta Sans', sans-serif",
                    fontSize:    '14px',
                    fontWeight:  form.hasEmployees === opt.value ? 600 : 400,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 5: Incorporation date ── */}
        {step === 5 && (
          <div>
            <h2
              className="text-xl font-bold mb-1"
              style={{ color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.3px' }}
            >
              When was your company incorporated?
            </h2>
            <p
              className="text-sm mb-6"
              style={{ color: '#6B7280', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Find this date on your certificate of incorporation from Companies House. Skip if you don't have it — we'll estimate.
            </p>
            <input
              type="date"
              value={form.incorporationDate}
              onChange={e => setForm(f => ({ ...f, incorporationDate: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              style={{ borderColor: '#E8E6E1', background: '#FFFFFF', color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            />
            <p
              className="text-xs"
              style={{ color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Don't know the date? Leave blank and we'll estimate based on a typical 12-month-old company.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              onClick={back}
              className="flex items-center gap-1.5 px-5 py-3 rounded-xl text-sm font-semibold border transition-colors"
              style={{ borderColor: '#E8E6E1', color: '#555', background: '#FFFFFF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
          <button
            onClick={next}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-opacity"
            style={{ background: '#2563EB', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {step === TOTAL_STEPS ? 'Generate my roadmap' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
