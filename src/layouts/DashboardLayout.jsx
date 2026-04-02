import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, MessageSquare, Heart, CreditCard, Settings,
  FolderOpen, Menu, X, LogOut, Star
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const customerNav = [
  { to: '/dashboard/customer',              icon: LayoutDashboard, label: 'Overview',     end: true },
  { to: '/dashboard/customer/messages',     icon: MessageSquare,   label: 'Messages' },
  { to: '/dashboard/customer/favorites',    icon: Heart,           label: 'Favourites' },
  { to: '/dashboard/customer/subscription', icon: CreditCard,      label: 'Subscription' },
  { to: '/dashboard/customer/settings',     icon: Settings,        label: 'Settings' },
]

const designerNav = [
  { to: '/dashboard/designer',              icon: LayoutDashboard, label: 'Overview',    end: true },
  { to: '/dashboard/designer/projects',     icon: FolderOpen,      label: 'Projects' },
  { to: '/dashboard/designer/messages',     icon: MessageSquare,   label: 'Messages' },
  { to: '/dashboard/designer/subscription', icon: CreditCard,      label: 'Subscription' },
  { to: '/dashboard/designer/settings',     icon: Settings,        label: 'Settings' },
]

export default function DashboardLayout({ role }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const nav = role === 'DESIGNER' ? designerNav : customerNav

  const handleLogout = async () => {
    await logout()
    toast.success('Signed out')
    navigate('/')
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <aside
        className={`flex-shrink-0 flex flex-col transition-all duration-300 border-r ${sidebarOpen ? 'w-60' : 'w-0 overflow-hidden'}`}
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-alt)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div
            className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: 'var(--color-gold)', color: '#1A1612' }}
          >
            DN
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--color-gold-lt)', fontFamily: 'Cormorant Garamond, serif' }}>
              DesignNest
            </div>
            <div className="text-xs" style={{ color: 'var(--color-muted)' }}>
              {role === 'DESIGNER' ? 'Designer Portal' : 'My Account'}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-0.5">
          {nav.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all duration-150 ${
                  isActive
                    ? 'text-stone-300 bg-gold-muted border-l-2'
                    : 'text-stone-100 opacity-60 hover:opacity-90 hover:bg-white/5'
                }`
              }
              style={({ isActive }) => isActive ? { borderColor: 'var(--color-gold)' } : {}}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          {user?.isPremium && (
            <div className="badge badge-gold mb-3 w-full justify-center">
              <Star size={11} /> Premium
            </div>
          )}
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: 'rgba(168,131,98,0.2)', color: 'var(--color-gold-lt)' }}
            >
              {user?.email?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>
                {user?.email}
              </div>
              <div className="text-xs" style={{ color: 'var(--color-muted)' }}>{role}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-ghost w-full justify-center text-xs gap-2">
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className="flex items-center gap-3 px-6 py-3 border-b flex-shrink-0 glass"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="p-1.5 rounded transition-colors hover:bg-white/5"
            style={{ color: 'var(--color-gold)' }}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <span className="text-sm font-medium" style={{ color: 'var(--color-muted)' }}>
            {role === 'DESIGNER' ? 'Designer Dashboard' : 'My Account'}
          </span>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
