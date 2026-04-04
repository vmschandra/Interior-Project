import { Eye, MessageSquare, Star, CreditCard } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function DesignerOverview() {
  const { user } = useAuthStore()
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Designer Dashboard</h1>
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{user?.email}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { icon: Eye,          label: 'Profile Views',   value: '—' },
          { icon: MessageSquare,label: 'Chat Requests',   value: '—' },
          { icon: Star,         label: 'Avg. Rating',     value: '—' },
          { icon: CreditCard,   label: 'Subscription',    value: user?.isPremium ? 'Premium' : 'Free' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="card p-5">
            <Icon size={18} className="mb-3" style={{ color: 'var(--color-gold)' }} />
            <div className="text-2xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--color-gold-lt)' }}>{value}</div>
            <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>{label}</div>
          </div>
        ))}
      </div>
      {!user?.isPremium && (
        <div className="card p-6" style={{ border: '1px solid rgba(57,255,20,0.3)', background: 'rgba(57,255,20,0.04)' }}>
          <h3 className="text-xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Enable Premium</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--color-muted)' }}>Receive chat messages from clients and appear higher in search. Starting at ₹200/month.</p>
          <Link to="/dashboard/designer/subscription" className="btn-primary">Upgrade Now</Link>
        </div>
      )}
    </div>
  )
}
