import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-bg)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded flex items-center justify-center text-sm font-bold"
              style={{ background: 'var(--color-gold)', color: '#0B1929' }}>
              DN
            </div>
            <span className="text-2xl font-semibold"
              style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--color-gold-lt)' }}>
              DesignNest
            </span>
          </Link>
          <h1 className="text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Reset your password
          </h1>
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle size={40} className="mx-auto mb-4" style={{ color: '#6BCF7F' }} />
              <h3 className="text-lg font-medium mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Check your email
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                If an account exists for <strong style={{ color: 'var(--color-text)' }}>{email}</strong>,
                you'll receive a reset link within a few minutes.
              </p>
              <Link to="/login" className="btn-outline mt-6 w-full justify-center">
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <div>
                <label className="label">Email address</label>
                <input type="email" className="input" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                {loading ? 'Sending…' : 'Send reset link'} <ArrowRight size={15} />
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--color-muted)' }}>
          Remember your password?{' '}
          <Link to="/login" className="font-medium" style={{ color: 'var(--color-gold-lt)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
