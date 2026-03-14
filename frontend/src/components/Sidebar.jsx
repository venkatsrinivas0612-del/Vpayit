import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  PiggyBank,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PlanBadge from './PlanBadge';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/bills',     icon: Receipt,         label: 'Bills'       },
  { to: '/payments',  icon: CreditCard,      label: 'Payments'   },
  { to: '/savings',   icon: PiggyBank,       label: 'Savings'    },
  { to: '/reports',   icon: BarChart3,       label: 'Reports'    },
  { to: '/settings',  icon: Settings,        label: 'Settings'   },
];

function getInitials(name) {
  if (!name) return 'V';
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

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
    onMobileClose?.();
  }

  const desktopWidth = collapsed ? 'md:w-[68px]' : 'md:w-60';

  return (
    <aside
      className={`
        flex flex-col shrink-0
        fixed inset-y-0 left-0 z-40 w-64
        md:relative md:inset-auto md:z-auto md:h-auto md:min-h-screen
        ${desktopWidth}
        transition-all duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
      style={{
        background: 'linear-gradient(180deg, rgba(15,10,40,0.97) 0%, rgba(8,8,25,0.98) 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Ambient top glow */}
      <div
        className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 100% 80% at 50% -20%, rgba(99,102,241,0.18), transparent)' }}
      />

      {/* Logo */}
      <div className="relative flex items-center gap-3 px-4 h-16" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 animate-pulse-glow"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className={`font-bold text-lg tracking-tight text-white ${collapsed ? 'md:hidden' : ''}`}>
          Vpayit
        </span>
        <button
          onClick={() => setCollapsed(c => !c)}
          className="ml-auto p-1.5 rounded-lg hidden md:flex items-center justify-center transition-colors cursor-pointer"
          style={{ color: 'rgba(148,163,184,0.6)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          aria-label="Toggle sidebar"
        >
          {collapsed
            ? <ChevronRight className="w-3.5 h-3.5" />
            : <ChevronLeft  className="w-3.5 h-3.5" />
          }
        </button>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
               ${isActive
                 ? 'text-white'
                 : 'text-slate-400 hover:text-slate-100'
               }`
            }
            style={({ isActive }) => isActive
              ? {
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))',
                  boxShadow:  'inset 0 0 0 1px rgba(99,102,241,0.3), 0 0 12px rgba(99,102,241,0.1)',
                }
              : {}
            }
            onMouseEnter={e => {
              if (!e.currentTarget.style.background.includes('gradient')) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              }
            }}
            onMouseLeave={e => {
              if (!e.currentTarget.style.background.includes('gradient')) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            {({ isActive }) => (
              <>
                <Icon
                  className="w-5 h-5 shrink-0"
                  style={{ color: isActive ? '#818cf8' : 'inherit' }}
                />
                <span className={collapsed ? 'md:hidden' : ''}>{label}</span>
                {isActive && !collapsed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="relative px-2 pb-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {!collapsed && (
          <div className="px-3 py-2 mb-1">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                {getInitials(profile?.business_name)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-white truncate">
                    {profile?.business_name || 'My Business'}
                  </p>
                  <PlanBadge plan={profile?.plan || 'free'} />
                </div>
                <p className="text-xs truncate" style={{ color: 'rgba(148,163,184,0.6)' }}>
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {confirmSignOut ? (
          <div
            className="mx-1 rounded-xl px-3 py-3"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-xs text-slate-300 font-medium mb-2.5">Sign out of Vpayit?</p>
            <div className="flex gap-2">
              <button
                onClick={handleSignOut}
                className="flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white' }}
              >
                Sign out
              </button>
              <button
                onClick={() => setConfirmSignOut(false)}
                className="flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(148,163,184,0.9)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleSignOutClick}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
            style={{ color: 'rgba(100,116,139,0.9)' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
              e.currentTarget.style.color = '#fca5a5';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'rgba(100,116,139,0.9)';
            }}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className={collapsed ? 'md:hidden' : ''}>Sign out</span>
          </button>
        )}
      </div>
    </aside>
  );
}
