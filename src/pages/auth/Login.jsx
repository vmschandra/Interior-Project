import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export default function Login() {
  const [params] = useSearchParams()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { user } = await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate(user.role === 'DESIGNER' ? '/dashboard/designer' : '/dashboard/customer')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div
              className="w-9 h-9 rounded flex items-center justify-center text-sm font-bold"
              style={{ background: 'var(--color-gold)', color: '#1A1612' }}
            >
              DN
            </div>
            <span
              className="text-2xl font-semibold"
              style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--color-gold-lt)' }}
            >
              DesignNest
            </span>
          </Link>
          <h1 className="text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Welcome back
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--color-muted)' }}>
            Sign in to your account to continue
          </p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs transition-colors hover:opacity-100"
                  style={{ color: 'var(--color-gold)' }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input pr-11"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-100"
                  style={{ color: 'var(--color-muted)' }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-2"
            >
              {loading ? 'Signing in…' : 'Sign in'} <ArrowRight size={15} />
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--color-muted)' }}>
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-medium transition-colors hover:opacity-100"
            style={{ color: 'var(--color-gold-lt)' }}
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
