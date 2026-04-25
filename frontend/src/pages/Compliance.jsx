import { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

/* ─── Date helpers ────────────────────────────────────────────────────────── */

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

/* ─── UK deadline calculator ──────────────────────────────────────────────── */

function calcDeadlines({ incorporationDate, vatRegistered, hasEmployees }) {
  const incDate = new Date(incorporationDate);
  const deadlines = [];

  // ── Confirmation Statement ──
  // Made up to date = 12 months after incorporation (or anniversary)
  // Filing deadline = 14 days after the made-up-to date
  const confMadeUpTo = addMonths(incDate, 12);
  const confDue = addDays(confMadeUpTo, 14);
  deadlines.push({
    id: 'conf',
    label: 'Confirmation Statement',
    due: confDue,
    desc: 'Annual snapshot of your company\'s directors, shareholders, and registered office. Filed with Companies House.',
    fee: '£34 filing fee (online). Free if no changes.',
    action: 'Log into your Companies House WebFiling account to submit.',
  });

  // ── Financial year end ──
  // Default: last day before anniversary of incorporation
  const fyEnd = new Date(incDate);
  fyEnd.setFullYear(fyEnd.getFullYear() + 1);
  fyEnd.setDate(fyEnd.getDate() - 1);

  // ── First Annual Accounts ──
  // Due 21 months from incorporation date (for newly incorporated companies)
  const firstAccountsDue = addMonths(incDate, 21);
  deadlines.push({
    id: 'accounts',
    label: 'Annual Accounts',
    due: firstAccountsDue,
    desc: 'Statutory accounts filed with Companies House. First accounts are due 21 months from incorporation.',
    fee: 'Accountant fee: £400–£1,500 depending on complexity.',
    action: 'Engage an accountant at least 3 months before this deadline.',
  });

  // ── Corporation Tax payment ──
  // 9 months + 1 day after financial year end
  const corpTaxPayment = addDays(addMonths(fyEnd, 9), 1);
  deadlines.push({
    id: 'ctpay',
    label: 'Corporation Tax Payment',
    due: corpTaxPayment,
    desc: 'Pay your Corporation Tax bill to HMRC. Based on your company\'s taxable profits for the year.',
    fee: '19% of profits up to £50,000. 25% above £250,000. Marginal relief between.',
    action: 'Set aside approximately 20% of every profit you make. Pay via HMRC online banking.',
  });

  // ── CT600 Corporation Tax Return ──
  // 12 months after financial year end
  const ct600Due = addMonths(fyEnd, 12);
  deadlines.push({
    id: 'ct600',
    label: 'Corporation Tax Return (CT600)',
    due: ct600Due,
    desc: 'The CT600 form filed with HMRC detailing your company\'s income, allowances, and tax calculation.',
    fee: 'Accountant fee: typically bundled with annual accounts preparation.',
    action: 'Your accountant files this. Ensure all bank statements and receipts are organised.',
  });

  // ── VAT Return ── (if registered)
  if (vatRegistered) {
    const now = new Date();
    const month = now.getMonth(); // 0 = Jan
    let vatDue;
    // Standard UK VAT quarters: Jan-Mar, Apr-Jun, Jul-Sep, Oct-Dec
    // Each quarter has a 1-month + 7 day payment window
    if (month < 3) {
      // Jan-Mar quarter → due 7 May
      vatDue = new Date(now.getFullYear(), 4, 7);
    } else if (month < 6) {
      // Apr-Jun quarter → due 7 Aug
      vatDue = new Date(now.getFullYear(), 7, 7);
    } else if (month < 9) {
      // Jul-Sep quarter → due 7 Nov
      vatDue = new Date(now.getFullYear(), 10, 7);
    } else {
      // Oct-Dec quarter → due 7 Feb next year
      vatDue = new Date(now.getFullYear() + 1, 1, 7);
    }
    deadlines.push({
      id: 'vat',
      label: 'VAT Return',
      due: vatDue,
      desc: 'Quarterly VAT return submitted to HMRC under Making Tax Digital. Report output VAT collected minus input VAT paid.',
      fee: 'Net VAT owed (output tax minus input tax). Can result in a refund.',
      action: 'Use Making Tax Digital-compatible software (e.g. Xero, FreeAgent) to submit.',
    });
  }

  // ── PAYE ── (if employees)
  if (hasEmployees) {
    const now = new Date();
    // Next 19th of the month
    const payeMonth = new Date(now.getFullYear(), now.getMonth() + 1, 19);
    deadlines.push({
      id: 'paye',
      label: 'PAYE & NI Payment',
      due: payeMonth,
      desc: 'Monthly payment to HMRC covering employee Income Tax deducted via PAYE plus employer and employee National Insurance contributions.',
      fee: 'Varies by payroll. Employer NI is 13.8% on earnings above the threshold.',
      action: 'Submit RTI (Full Payment Submission) on or before each payday. Pay by 19th of following month.',
    });
  }

  // Sort by due date ascending
  deadlines.sort((a, b) => new Date(a.due) - new Date(b.due));
  return deadlines;
}

function calcScore(deadlines) {
  let score = 100;
  for (const d of deadlines) {
    const days = daysUntil(d.due);
    if (days < 0)   score -= 25;
    else if (days < 30)  score -= 12;
    else if (days < 60)  score -= 6;
    else if (days < 90)  score -= 3;
  }
  return Math.max(0, Math.min(100, score));
}

/* ─── Sub-components ──────────────────────────────────────────────────────── */

function ScoreCircle({ score }) {
  const colour = score >= 80 ? '#16A34A' : score >= 60 ? '#D97706' : '#DC2626';
  const label  = score >= 80 ? 'Strong' : score >= 60 ? 'Fair' : 'Needs attention';
  const r = 40;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28" style={{ transform: 'rotate(-90deg)' }} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#F0EDE8" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke={colour}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span style={{ fontSize: '26px', fontWeight: 800, color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-1px' }}>
            {score}
          </span>
          <span style={{ fontSize: '10px', color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>/100</span>
        </div>
      </div>
      <span
        className="mt-2 text-xs font-bold uppercase tracking-wide"
        style={{ color: colour, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {label}
      </span>
    </div>
  );
}

function StatusDot({ days }) {
  const colour =
    days < 0    ? '#DC2626' :
    days <= 30  ? '#D97706' :
    days <= 90  ? '#2563EB' : '#16A34A';
  return (
    <span
      className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5"
      style={{ background: colour, display: 'block' }}
    />
  );
}

function StatusBadge({ days }) {
  if (days < 0)   return <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#FEE2E2', color: '#DC2626', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>OVERDUE</span>;
  if (days === 0) return <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#FEE2E2', color: '#DC2626', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>TODAY</span>;
  if (days <= 30) return <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: '#D97706', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{days} days</span>;
  if (days <= 90) return <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#EEF2FF', color: '#2563EB', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{days} days</span>;
  return <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#DCFCE7', color: '#16A34A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{days} days</span>;
}

/* ─── Setup form ──────────────────────────────────────────────────────────── */

function SetupForm({ onSubmit }) {
  const [form, setForm] = useState({
    incorporationDate: '',
    vatRegistered: false,
    hasEmployees: false,
  });

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: '#FEFDFB' }}>
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-1"
            style={{ color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Compliance Engine
          </p>
          <h1
            className="text-2xl font-bold"
            style={{ color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.5px' }}
          >
            Your UK compliance roadmap
          </h1>
          <p
            className="mt-2 text-sm leading-relaxed"
            style={{ color: '#6B7280', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Three quick questions and Vpayit will calculate every deadline you need to know about — Companies House, HMRC, and more.
          </p>
        </div>

        <div
          className="rounded-2xl border p-8 space-y-7"
          style={{ background: '#FFFFFF', borderColor: '#E8E6E1' }}
        >

          {/* Incorporation date */}
          <div>
            <label
              className="block text-sm font-bold mb-1"
              style={{ color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              When was your company incorporated?
            </label>
            <p
              className="text-xs mb-3"
              style={{ color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Find this on your Companies House certificate of incorporation.
            </p>
            <input
              type="date"
              value={form.incorporationDate}
              onChange={e => setForm(f => ({ ...f, incorporationDate: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ borderColor: '#E8E6E1', background: '#FEFDFB', color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            />
          </div>

          {/* VAT */}
          <div>
            <label
              className="block text-sm font-bold mb-3"
              style={{ color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Are you VAT registered?
            </label>
            <div className="flex gap-3">
              {[{ label: 'Yes, I am VAT registered', value: true }, { label: 'No, not yet', value: false }].map(opt => (
                <button
                  key={String(opt.value)}
                  onClick={() => setForm(f => ({ ...f, vatRegistered: opt.value }))}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold border transition-all text-left"
                  style={{
                    borderColor: form.vatRegistered === opt.value ? '#2563EB' : '#E8E6E1',
                    background:  form.vatRegistered === opt.value ? '#EEF2FF' : '#FEFDFB',
                    color:       form.vatRegistered === opt.value ? '#2563EB' : '#555',
                    fontFamily:  "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Employees */}
          <div>
            <label
              className="block text-sm font-bold mb-3"
              style={{ color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Do you have employees on payroll?
            </label>
            <div className="flex gap-3">
              {[{ label: 'Yes, I have employees', value: true }, { label: 'No employees yet', value: false }].map(opt => (
                <button
                  key={String(opt.value)}
                  onClick={() => setForm(f => ({ ...f, hasEmployees: opt.value }))}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold border transition-all text-left"
                  style={{
                    borderColor: form.hasEmployees === opt.value ? '#2563EB' : '#E8E6E1',
                    background:  form.hasEmployees === opt.value ? '#EEF2FF' : '#FEFDFB',
                    color:       form.hasEmployees === opt.value ? '#2563EB' : '#555',
                    fontFamily:  "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => onSubmit(form)}
            disabled={!form.incorporationDate}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-40"
            style={{ background: '#2563EB', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Calculate my compliance roadmap →
          </button>
        </div>

        <p
          className="text-xs text-center mt-4"
          style={{ color: '#C4BFB8', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Deadlines calculated from Companies House and HMRC rules. Always confirm with a qualified accountant.
        </p>
      </div>
    </div>
  );
}

/* ─── Results view ────────────────────────────────────────────────────────── */

function Results({ deadlines, score, onBack }) {
  const urgent = deadlines.filter(d => daysUntil(d.due) <= 30);

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: '#FEFDFB' }}>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-1"
              style={{ color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              UK Compliance Roadmap
            </p>
            <h1
              className="text-2xl font-bold"
              style={{ color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.5px' }}
            >
              Your compliance calendar
            </h1>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-semibold transition-colors"
            style={{ color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            onMouseEnter={e => (e.currentTarget.style.color = '#111')}
            onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}
          >
            <ArrowLeft className="w-4 h-4" /> Edit details
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className="rounded-2xl border p-6 flex flex-col items-center justify-center"
            style={{ background: '#FFFFFF', borderColor: '#E8E6E1' }}
          >
            <ScoreCircle score={score} />
            <p
              className="text-xs mt-3 text-center"
              style={{ color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Compliance Score
            </p>
          </div>

          <div
            className="rounded-2xl border p-6 flex flex-col justify-center"
            style={{ background: '#FFFFFF', borderColor: '#E8E6E1' }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Total deadlines
            </p>
            <p
              className="text-4xl font-extrabold"
              style={{ color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-1px' }}
            >
              {deadlines.length}
            </p>
            <p
              className="text-sm mt-1"
              style={{ color: '#16A34A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              tracked automatically
            </p>
          </div>

          <div
            className="rounded-2xl border p-6 flex flex-col justify-center"
            style={{
              background: urgent.length > 0 ? '#FFF7ED' : '#FFFFFF',
              borderColor: urgent.length > 0 ? '#FED7AA' : '#E8E6E1',
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: urgent.length > 0 ? '#D97706' : '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Urgent (≤30 days)
            </p>
            <p
              className="text-4xl font-extrabold"
              style={{ color: urgent.length > 0 ? '#D97706' : '#111', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-1px' }}
            >
              {urgent.length}
            </p>
            <p
              className="text-sm mt-1"
              style={{ color: urgent.length > 0 ? '#D97706' : '#16A34A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {urgent.length > 0 ? 'need your attention now' : 'all clear'}
            </p>
          </div>
        </div>

        {/* Urgent alert */}
        {urgent.length > 0 && (
          <div
            className="rounded-2xl border p-6"
            style={{ background: '#FFF7ED', borderColor: '#FED7AA' }}
          >
            <h2
              className="text-xs font-bold uppercase tracking-widest mb-4"
              style={{ color: '#D97706', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Action required now
            </h2>
            <div className="space-y-3">
              {urgent.map(d => (
                <div key={d.id} className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#D97706' }} />
                  <div>
                    <p
                      className="text-sm font-bold"
                      style={{ color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      {d.label}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: '#92400E', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      Due {formatDate(d.due)} — {daysUntil(d.due)} days away
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: '#92400E', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      {d.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deadline list */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: '#FFFFFF', borderColor: '#E8E6E1' }}
        >
          <div
            className="px-6 py-4 border-b"
            style={{ borderColor: '#F0EDE8' }}
          >
            <h2
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              All deadlines — sorted by urgency
            </h2>
          </div>

          <div className="divide-y" style={{ borderColor: '#F0EDE8' }}>
            {deadlines.map(d => {
              const days = daysUntil(d.due);
              return (
                <div key={d.id} className="px-6 py-5 flex items-start gap-4">
                  <StatusDot days={days} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 flex-wrap mb-0.5">
                      <p
                        className="text-sm font-bold"
                        style={{ color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        {d.label}
                      </p>
                      <StatusBadge days={days} />
                    </div>
                    <p
                      className="text-xs mb-2"
                      style={{ color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      Due {formatDate(d.due)}
                    </p>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: '#555', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      {d.desc}
                    </p>
                    <p
                      className="text-xs mt-1.5"
                      style={{ color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      {d.fee}
                    </p>
                    <div
                      className="mt-3 rounded-lg px-3 py-2"
                      style={{ background: '#F5F4F0' }}
                    >
                      <p
                        className="text-xs"
                        style={{ color: '#555', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        <span style={{ fontWeight: 700, color: '#111' }}>What to do: </span>
                        {d.action}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p
          className="text-xs text-center pb-4"
          style={{ color: '#C4BFB8', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Deadlines calculated from Companies House and HMRC rules. Always confirm significant decisions with a qualified accountant.
        </p>
      </div>
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────────────────────── */

export default function Compliance() {
  const [step, setStep]         = useState('form');
  const [deadlines, setDeadlines] = useState([]);
  const [score, setScore]       = useState(0);

  useEffect(() => {
    document.title = 'Compliance — Vpayit';
  }, []);

  function handleSubmit(form) {
    const d = calcDeadlines(form);
    setDeadlines(d);
    setScore(calcScore(d));
    setStep('results');
  }

  if (step === 'form') {
    return <SetupForm onSubmit={handleSubmit} />;
  }

  return (
    <Results
      deadlines={deadlines}
      score={score}
      onBack={() => setStep('form')}
    />
  );
}
