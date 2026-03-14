const PLAN_CONFIG = {
  free:     { label: 'Free',     style: { background: 'rgba(100,116,139,0.2)', color: 'rgba(148,163,184,0.8)', border: '1px solid rgba(100,116,139,0.2)' } },
  pro:      { label: 'Pro',      style: { background: 'rgba(99,102,241,0.2)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' } },
  business: { label: 'Business', style: { background: 'rgba(139,92,246,0.2)', color: '#c084fc', border: '1px solid rgba(139,92,246,0.3)' } },
};

export default function PlanBadge({ plan }) {
  const cfg = PLAN_CONFIG[plan?.toLowerCase()] ?? PLAN_CONFIG.free;
  return (
    <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full" style={cfg.style}>
      {cfg.label}
    </span>
  );
}
