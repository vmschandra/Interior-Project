import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, ChevronDown } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = async () => {
    await logout()
    toast.success('Signed out')
    navigate('/')
  }

  const dashPath = user?.role === 'DESIGNER' ? '/dashboard/designer' : '/dashboard/customer'

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass border-b' : 'bg-transparent'
      }`}
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="container-page flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div
            className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-105"
            style={{ background: 'var(--color-gold)', color: '#1A1612' }}
          >
            DN
          </div>
          <span
            className="text-xl font-semibold tracking-tight"
            style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--color-gold-lt)' }}
          >
            DesignNest
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { to: '/designers', label: 'Browse Designers' },
            { to: '/pricing', label: 'Pricing' },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-4 py-2 text-sm transition-colors rounded ${
                  isActive ? 'text-stone-300' : 'opacity-65 hover:opacity-100'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to={dashPath} className="btn-ghost text-sm">Dashboard</Link>
              <button onClick={handleLogout} className="btn-outline text-xs">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
              <Link to="/register" className="btn-primary text-xs">Get started</Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded transition-colors hover:bg-white/5"
          onClick={() => setOpen(o => !o)}
          style={{ color: 'var(--color-text)' }}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="md:hidden border-t"
          style={{ background: 'var(--color-bg-alt)', borderColor: 'var(--color-border)' }}
        >
          <nav className="container-page py-4 space-y-1">
            {[
              { to: '/designers', label: 'Browse Designers' },
              { to: '/pricing', label: 'Pricing' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 text-sm rounded opacity-80 hover:opacity-100 hover:bg-white/5"
              >
                {label}
              </Link>
            ))}
            <hr className="divider my-3" />
            {isAuthenticated ? (
              <>
                <Link to={dashPath} onClick={() => setOpen(false)} className="block px-3 py-2.5 text-sm">Dashboard</Link>
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2.5 text-sm opacity-60">Sign out</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="block px-3 py-2.5 text-sm">Sign in</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-primary w-full justify-center mt-2">Get started</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
