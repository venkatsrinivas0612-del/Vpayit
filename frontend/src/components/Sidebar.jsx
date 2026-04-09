import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/chat',      icon: MessageSquare,   label: 'Ask AI'       },
  { to: '/compliance',icon: ShieldCheck,     label: 'Compliance'  },
  { to: '/settings',  icon: Settings,        label: 'Settings'    },
];

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed]     = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  async function handleSignOut() {
    await signOut();
    onMobileClose?.();
    navigate('/auth/login');
  }

  const w = collapsed ? 'md:w-16' : 'md:w-56';

  return (
    <aside
      className={`
        flex flex-col shrink-0
        fixed inset-y-0 left-0 z-40 w-56
        md:relative md:inset-auto md:z-auto md:h-auto md:min-h-screen
        ${w}
        transition-transform duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
      style={{ background: '#FEFDFB', borderRight: '1px solid #E8E6E1' }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 h-16"
        style={{ borderBottom: '1px solid #E8E6E1' }}
      >
        {/* Wordmark */}
        <span
          className={`font-extrabold text-lg tracking-tight ${collapsed ? 'md:hidden' : ''}`}
          style={{ color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.5px' }}
        >
          Vpayit
        </span>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${collapsed ? 'md:hidden' : ''}`}
          style={{ background: '#EEF2FF', color: '#2563EB', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          AI
        </span>
        <button
          onClick={() => setCollapsed(c => !c)}
          className="ml-auto p-1 rounded-lg transition-colors hidden md:flex items-center justify-center"
          style={{ color: '#9CA3AF' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#F0EDE8')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          aria-label="Toggle sidebar"
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4" />
            : <ChevronLeft  className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            onClick={() => onMobileClose?.()}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive ? 'active-nav' : 'inactive-nav'
              }`
            }
            style={({ isActive }) => ({
              background: isActive ? '#2563EB' : 'transparent',
              color: isActive ? '#FFFFFF' : '#555',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            })}
            onMouseEnter={e => {
              if (!e.currentTarget.classList.contains('active-nav')) {
                e.currentTarget.style.background = '#F0EDE8';
                e.currentTarget.style.color = '#111';
              }
            }}
            onMouseLeave={e => {
              if (!e.currentTarget.style.background.includes('rgb(37')) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#555';
              }
            }}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className={collapsed ? 'md:hidden' : ''}>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 pb-4" style={{ borderTop: '1px solid #E8E6E1', paddingTop: '12px' }}>
        {!collapsed && (
          <div className="px-3 py-2 mb-2">
            <p
              className="text-xs font-bold truncate"
              style={{ color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {profile?.business_name || 'My Business'}
            </p>
            <p
              className="text-xs truncate mt-0.5"
              style={{ color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {user?.email}
            </p>
          </div>
        )}

        {confirmLogout ? (
          <div
            className="rounded-xl p-3 mx-0"
            style={{ background: '#F5F4F0' }}
          >
            <p
              className="text-xs font-semibold mb-2.5"
              style={{ color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Sign out?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleSignOut}
                className="flex-1 text-xs py-1.5 rounded-lg font-semibold text-white transition-colors"
                style={{ background: '#DC2626', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmLogout(false)}
                className="flex-1 text-xs py-1.5 rounded-lg font-semibold transition-colors"
                style={{ background: '#E8E6E1', color: '#555', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmLogout(true)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F0EDE8'; e.currentTarget.style.color = '#111'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9CA3AF'; }}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className={collapsed ? 'md:hidden' : ''}>Sign out</span>
          </button>
        )}
      </div>
    </aside>
  );
}
