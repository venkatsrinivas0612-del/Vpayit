import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Mobile backdrop overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main className="flex-1 overflow-auto min-w-0" style={{ background: '#FEFDFB' }}>
        {/* Mobile top bar — visible only on small screens */}
        <div
          className="md:hidden sticky top-0 z-20 flex items-center gap-3 px-4 h-14"
          style={{ background: '#FEFDFB', borderBottom: '1px solid #E8E6E1' }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: '#555' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#F0EDE8')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span
            className="font-extrabold text-lg tracking-tight"
            style={{ color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.5px' }}
          >
            Vpayit
          </span>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: '#EEF2FF', color: '#2563EB', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            AI
          </span>
        </div>

        {children}
      </main>
    </div>
  );
}
