import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer
      className="border-t"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-alt)' }}
    >
      <div className="container-page py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold"
                style={{ background: 'var(--color-gold)', color: '#0B1929' }}
              >
                DN
              </div>
              <span
                className="text-xl font-semibold"
                style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--color-gold-lt)' }}
              >
                DesignNest
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--color-muted)' }}>
              Connecting discerning clients with India's finest interior designers.
              Curated spaces, crafted with intention.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--color-gold)' }}>
              Platform
            </h4>
            <ul className="space-y-2.5">
              {[
                { to: '/designers', label: 'Browse Designers' },
                { to: '/pricing', label: 'Pricing' },
                { to: '/register?role=designer', label: 'Join as Designer' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm transition-colors hover:opacity-100"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--color-gold)' }}>
              Company
            </h4>
            <ul className="space-y-2.5">
              {[
                { to: '/about', label: 'About' },
                { to: '/contact', label: 'Contact' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm transition-colors hover:opacity-100"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="divider my-10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            © {new Date().getFullYear()} DesignNest. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {['Privacy Policy', 'Terms of Service'].map(label => (
              <span
                key={label}
                className="text-xs cursor-pointer transition-colors hover:opacity-100"
                style={{ color: 'var(--color-muted)' }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
