import { useState } from 'react';
import { Menu, Zap } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ background: '#060c1a' }}>
      {/* Background ambient glows */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% -10%, rgba(99,102,241,0.12), transparent),
            radial-gradient(ellipse 60% 40% at 80% 100%, rgba(139,92,246,0.08), transparent)
          `,
          zIndex: 0,
        }}
      />

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <main className="relative flex-1 overflow-auto min-w-0" style={{ zIndex: 1 }}>
        {/* Mobile top bar */}
        <div
          className="md:hidden sticky top-0 z-20 flex items-center gap-3 px-4 h-14"
          style={{
            background:   'rgba(6,12,26,0.92)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl transition-colors cursor-pointer"
            style={{ color: 'rgba(148,163,184,0.8)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white">Vpayit</span>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}
