const PLAN_CONFIG = {
  free:     { label: 'Free',     cls: 'bg-slate-600 text-slate-200' },
  pro:      { label: 'Pro',      cls: 'bg-blue-600 text-white'      },
  business: { label: 'Business', cls: 'bg-purple-600 text-white'    },
};

export default function PlanBadge({ plan }) {
  const cfg = PLAN_CONFIG[plan?.toLowerCase()] ?? PLAN_CONFIG.free;
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}
