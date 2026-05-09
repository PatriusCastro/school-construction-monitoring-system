'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, AlertCircle, Loader2, Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen">

      {/* Left Panel */}
      <div className="hidden lg:flex w-[45%] bg-[#0d2137] flex-col justify-between p-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#1a3a5c] flex items-center justify-center">
            <Building2 size={20} className="text-[#4a9fd4]" />
          </div>
          <span className="text-white font-semibold text-sm tracking-wide">DepEd SchoolBuild</span>
        </div>

        <div className="flex flex-col gap-10">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight tracking-tight mb-4">
              Manage school<br />construction with<br />precision.
            </h1>
            <p className="text-[#7fb3d3] text-sm leading-relaxed max-w-xs">
              Track progress, monitor budgets, and coordinate projects across every district — all in one place.
            </p>
          </div>

          <div className="flex items-center gap-6 bg-white/5 border border-white/10 rounded-xl px-6 py-5">
            <div className="flex flex-col gap-1">
              <span className="text-[#4a9fd4] text-2xl font-bold">847</span>
              <span className="text-[#7fb3d3] text-[11px] uppercase tracking-widest">Active Projects</span>
            </div>
            <div className="w-px h-9 bg-white/10" />
            <div className="flex flex-col gap-1">
              <span className="text-[#4a9fd4] text-2xl font-bold">₱2.4B</span>
              <span className="text-[#7fb3d3] text-[11px] uppercase tracking-widest">Funds Tracked</span>
            </div>
            <div className="w-px h-9 bg-white/10" />
            <div className="flex flex-col gap-1">
              <span className="text-[#4a9fd4] text-2xl font-bold">17</span>
              <span className="text-[#7fb3d3] text-[11px] uppercase tracking-widest">Regions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-slate-50 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile brand */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-lg bg-[#1a3a5c] flex items-center justify-center">
              <Building2 size={16} className="text-[#4a9fd4]" />
            </div>
            <span className="text-slate-800 font-semibold text-sm">DepEd SchoolBuild</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#0d2137] tracking-tight mb-1">Welcome back</h2>
            <p className="text-slate-500 text-sm">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-700 tracking-wide">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-11 px-4 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg outline-none transition focus:border-[#1a5a8a] focus:ring-2 focus:ring-[#1a5a8a]/10 placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-slate-700 tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full h-11 px-4 pr-11 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg outline-none transition focus:border-[#1a5a8a] focus:ring-2 focus:ring-[#1a5a8a]/10 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div role="alert" className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full h-11 mt-1 bg-[#1a3a5c] hover:bg-[#0d2137] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-7">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#1a5a8a] font-semibold hover:underline">
              Create one
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}