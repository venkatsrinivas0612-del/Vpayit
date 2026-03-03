import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  PiggyBank,
  BarChart3,
  Settings,
  LogOut,
  Building2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/bills',     icon: Receipt,          label: 'Bills'       },
  { to: '/payments',  icon: CreditCard,       label: 'Payments'   },
  { to: '/savings',   icon: PiggyBank,        label: 'Savings'    },
  { to: '/reports',   icon: BarChart3,        label: 'Reports'    },
  { to: '/settings',  icon: Settings,         label: 'Settings'   },
];

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  async function handleSignOut() {
    await signOut();
    onMobileClose?.();
    navigate('/auth/login');
  }

  function handleSignOutClick() {
    if (collapsed) setCollapsed(false);
    setConfirmSignOut(true);
  }

  function handleNavClick() {
    // Close mobile sidebar when navigating
    onMobileClose?.();
  }

  // On desktop: w-16 when collapsed, w-60 when expanded
  // On mobile: always w-64 (fixed overlay, width doesn't affect layout)
  const desktopWidth = collapsed ? 'md:w-16' : 'md:w-60';

  return (
    <aside
      className={`
        flex flex-col bg-slate-900 text-slate-100 shrink-0
        fixed inset-y-0 left-0 z-40 w-64
        md:relative md:inset-auto md:z-auto md:h-auto md:min-h-screen
        ${desktopWidth}
        transition-transform duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-700/60">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        {/* Always show on mobile; hide on desktop when collapsed */}
        <span className={`font-bold text-lg tracking-tight text-white ${collapsed ? 'md:hidden' : ''}`}>
          Vpayit
        </span>
        {/* Collapse toggle — desktop only */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="ml-auto p-1 rounded hover:bg-slate-700 transition-colors hidden md:block"
          aria-label="Toggle sidebar"
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4 text-slate-400" />
            : <ChevronLeft  className="w-4 h-4 text-slate-400" />
          }
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
               ${isActive
                 ? 'bg-blue-600 text-white'
                 : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
               }`
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            {/* Always show on mobile; hide on desktop when collapsed */}
            <span className={collapsed ? 'md:hidden' : ''}>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User / sign-out */}
      <div className="border-t border-slate-700/60 p-3 space-y-1">
        {/* Always show on mobile; hide on desktop when collapsed */}
        <div className={`px-3 py-2 ${collapsed ? 'md:hidden' : ''}`}>
          <p className="text-xs font-semibold text-white truncate">
            {profile?.business_name || 'My Business'}
          </p>
          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
        </div>
        {confirmSignOut ? (
          <div className="bg-slate-800 rounded-lg px-3 py-3">
            <p className="text-xs text-slate-300 font-medium mb-2.5">Sign out of Vpayit?</p>
            <div className="flex gap-2">
              <button
                onClick={handleSignOut}
                className="flex-1 text-xs bg-red-600 hover:bg-red-700 text-white py-1.5 rounded-md font-medium transition-colors"
              >
                Sign out
              </button>
              <button
                onClick={() => setConfirmSignOut(false)}
                className="flex-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 py-1.5 rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleSignOutClick}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className={collapsed ? 'md:hidden' : ''}>Sign out</span>
          </button>
        )}
      </div>
    </aside>
  );
}
