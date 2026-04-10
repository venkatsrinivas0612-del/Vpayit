import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

const STAGE_LABEL = { aspiring: 'Aspiring', growth: 'Growth', executive: 'Executive' };
const STAGE_COLOUR = { aspiring: '#7C3AED', growth: '#2563EB', executive: '#0F172A' };

export default function BriefHistory() {
  const { user } = useAuth();
  const [briefs, setBriefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [notSubscribed, setNotSubscribed] = useState(false);

  useEffect(() => {
    document.title = 'Brief History — Vpayit';
    if (!user?.email) return;

    fetch(`${API}/api/v1/brief/history?email=${encodeURIComponent(user.email)}`)
      .then(r => r.json())
      .then(data => {
        if (data.briefs) {
          setBriefs(data.briefs);
          if (data.briefs.length === 0) setNotSubscribed(true);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: '#FEFDFB', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#9CA3AF' }}>
            Your AI Chief of Staff
          </p>
          <h1 className="text-2xl font-bold" style={{ color: '#111', letterSpacing: '-0.5px' }}>
            Morning Brief Archive
          </h1>
          <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
            Every brief generated for your business, in order.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-3 py-12" style={{ color: '#9CA3AF' }}>
            <span className="inline-flex gap-1">
              {[0, 150, 300].map(d => (
                <span key={d} className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </span>
            <span className="text-sm">Loading your briefs…</span>
          </div>
        )}

        {/* Not subscribed */}
        {!loading && notSubscribed && (
          <div className="rounded-2xl border p-8 text-center" style={{ borderColor: '#E8E6E1', background: '#fff' }}>
            <p className="text-4xl mb-4">📬</p>
            <p className="font-bold text-lg mb-2" style={{ color: '#111' }}>No briefs yet</p>
            <p className="text-sm mb-6" style={{ color: '#9CA3AF' }}>
              Your morning briefs will appear here after your first delivery at 8am.
            </p>
            <a
              href="/morning-brief"
              className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: '#2563EB' }}
            >
              Sign up for the morning brief →
            </a>
          </div>
        )}

        {/* Brief list */}
        {!loading && briefs.length > 0 && (
          <div className="space-y-3">
            {briefs.map((b, i) => {
              const isOpen = expanded === b.id;
              const stage = b.business_stage || 'growth';
              const colour = STAGE_COLOUR[stage] ?? '#2563EB';

              return (
                <div
                  key={b.id}
                  className="rounded-2xl border overflow-hidden transition-all duration-300"
                  style={{ borderColor: isOpen ? colour : '#E8E6E1', background: '#fff' }}
                >
                  {/* Row */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : b.id)}
                    className="w-full text-left px-6 py-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      {/* Issue number */}
                      <span
                        className="text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: isOpen ? colour : '#F5F4F0', color: isOpen ? '#fff' : '#9CA3AF' }}
                      >
                        {briefs.length - i}
                      </span>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#111' }}>
                          {formatDate(b.generated_at)}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                          Delivered at {formatTime(b.generated_at)}
                          {b.business_stage && (
                            <span
                              className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold"
                              style={{ background: colour + '18', color: colour }}
                            >
                              {STAGE_LABEL[stage]}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <span style={{ color: '#C4BFB8', fontSize: '18px', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      ↓
                    </span>
                  </button>

                  {/* Expanded content */}
                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 border-t" style={{ borderColor: '#F0EDE8' }}>
                      <p
                        className="leading-relaxed"
                        style={{
                          fontFamily: "'Instrument Serif', serif",
                          fontSize: '19px',
                          color: '#111',
                          lineHeight: '1.7',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {b.content}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
