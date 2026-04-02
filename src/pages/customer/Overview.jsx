import { LayoutDashboard, MessageSquare, Heart, Star, CreditCard } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function CustomerOverview() {
  const { user } = useAuthStore()
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          Welcome back
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{user?.email}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { icon: Heart,        label: 'Saved Designers',   value: '—',  to: '/dashboard/customer/favorites' },
          { icon: MessageSquare,label: 'Active Chats',       value: '—',  to: '/dashboard/customer/messages' },
          { icon: Star,         label: 'Reviews Written',    value: '—',  to: null },
          { icon: CreditCard,   label: 'Subscription',       value: user?.isPremium ? 'Premium' : 'Free', to: '/dashboard/customer/subscription' },
        ].map(({ icon: Icon, label, value, to }) => (
          <div key={label} className={`card p-5 ${to ? 'card-hover cursor-pointer' : ''}`}>
            <Icon size={18} className="mb-3" style={{ color: 'var(--color-gold)' }} />
            <div className="text-2xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--color-gold-lt)' }}>{value}</div>
            <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>{label}</div>
          </div>
        ))}
      </div>
      {!user?.isPremium && (
        <div className="card p-6" style={{ border: '1px solid rgba(168,131,98,0.3)', background: 'rgba(168,131,98,0.04)' }}>
          <h3 className="text-xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Unlock Premium</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--color-muted)' }}>Upgrade to chat directly with interior designers. Starting at ₹1,000/month.</p>
          <Link to="/dashboard/customer/subscription" className="btn-primary">Upgrade Now</Link>
        </div>
      )}
    </div>
  )
}
