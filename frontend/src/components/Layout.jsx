import { useState } from 'react';
import { Menu, Building2 } from 'lucide-react';
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

      <main className="flex-1 overflow-auto bg-slate-50 min-w-0">
        {/* Mobile top bar — visible only on small screens */}
        <div className="md:hidden sticky top-0 z-20 flex items-center gap-3 px-4 h-14 border-b border-slate-200 bg-white shadow-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">Vpayit</span>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}
