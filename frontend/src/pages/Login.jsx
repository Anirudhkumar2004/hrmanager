import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LockKeyhole, ShieldCheck, UserRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(username.trim(), password)
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (loginError) {
      setError(loginError.response?.data?.detail || 'Unable to sign in. Check your username and password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[1.08fr_0.92fr]">
      <section className="hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-lg font-bold">H</div>
          <span className="text-xl font-bold tracking-tight">HRGenius</span>
        </div>
        <div className="max-w-xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-violet-300">People operations, simplified</p>
          <h1 className="text-5xl font-bold leading-tight">Manage your workforce with clarity.</h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-slate-300">Employees, attendance, leave, payroll and reports—all connected in one professional workspace.</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-400"><ShieldCheck className="h-5 w-5 text-violet-400" />Secure JWT-based access</div>
      </section>

      <section className="flex items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 text-2xl font-bold text-white shadow-lg shadow-violet-200 lg:hidden">H</div>
            <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-500">Sign in to your HR workspace</p>
          </div>

          {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block text-sm font-semibold text-slate-700">Username
              <div className="relative mt-2"><UserRound className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" /><input value={username} onChange={(event) => setUsername(event.target.value)} required autoComplete="username" className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-3 text-slate-900 outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-100" /></div>
            </label>
            <label className="block text-sm font-semibold text-slate-700">Password
              <div className="relative mt-2"><LockKeyhole className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-3 text-slate-900 outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-100" /></div>
            </label>
            <button type="submit" disabled={submitting} className="h-12 w-full rounded-xl bg-violet-700 font-semibold text-white shadow-lg shadow-violet-200 hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? 'Signing in...' : 'Sign in'}</button>
          </form>
        </div>
      </section>
    </main>
  )
}
