'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, AlertCircle, Loader2, Building2, Info, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', data.user.id)
    }

    router.push('/dashboard')
    router.refresh()
  }

  const getStrength = () => {
    if (!password) return null
    if (password.length < 6) return { label: 'Too short', color: 'bg-[#DC2626]', width: 'w-1/4', text: 'text-[#DC2626]' }
    if (password.length < 8) return { label: 'Weak', color: 'bg-[#DC2626]', width: 'w-2/5', text: 'text-[#DC2626]' }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) return { label: 'Fair', color: 'bg-[#FFB900]', width: 'w-3/5', text: 'text-[#FFB900]' }
    return { label: 'Strong', color: 'bg-[#27AE60]', width: 'w-full', text: 'text-[#27AE60]' }
  }

  const strength = getStrength()
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword

  return (
    <div className="flex min-h-screen">

      {/* Left Panel */}
      <div className="hidden lg:flex w-[45%] bg-[#0F2444] flex-col justify-between p-10 relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/assets/background.png"
            alt=""
            className="w-full h-full object-cover opacity-70"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#0F2444] flex items-center justify-center">
            <Building2 size={24} className="text-[#4a9fd4]" />
          </div>
          <span className="text-white font-semibold text-lg tracking-wide">School Construction Monitoring System</span>
        </div>

        <div className="flex flex-col gap-10">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight tracking-tight mb-4">
              Join the team<br />building better schools.
            </h1>
            <p className="text-[#7fb3d3] text-sm leading-relaxed max-w-xs">
              Get instant access to dashboards, project maps, construction data, and real-time progress monitoring.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {[
              'Live construction progress tracking',
              'Interactive school maps & geolocation',
              'Planning parameters & budget tools',
              'Region-wide data visualization',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-[#4a9fd4] shrink-0" />
                <span className="text-[#b8d4e8] text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-slate-50 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile brand */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-lg bg-[#0F2444] flex items-center justify-center">
              <Building2 size={16} className="text-[#4a9fd4]" />
            </div>
            <span className="text-slate-800 font-semibold text-sm">DepEd SchoolBuild</span>
          </div>
        
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md shadow-slate-100 p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#0F2444] tracking-tight mb-1">Create an account</h2>
              <p className="text-slate-500 text-sm">Fill in the details below — no email verification needed.</p>
            </div>

            <form onSubmit={handleRegister} className="flex flex-col gap-5">

              {/* Full name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fullName" className="text-xs font-semibold text-slate-700 tracking-wide">
                  Full name
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Juan dela Cruz"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                  className="h-11 px-4 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg outline-none transition focus:border-[#1a5a8a] focus:ring-2 focus:ring-[#1a5a8a]/10 placeholder:text-slate-400"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-xs font-semibold text-slate-700 tracking-wide">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@deped.gov.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-11 px-4 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg outline-none transition focus:border-[#1a5a8a] focus:ring-2 focus:ring-[#1a5a8a]/10 placeholder:text-slate-400"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-xs font-semibold text-slate-700 tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
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
                {strength && (
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${strength.color} ${strength.width}`} />
                    </div>
                    <span className={`text-xs font-medium ${strength.text}`}>{strength.label}</span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-700 tracking-wide">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="w-full h-11 px-4 pr-11 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg outline-none transition focus:border-[#1a5a8a] focus:ring-2 focus:ring-[#1a5a8a]/10 placeholder:text-slate-400"
                  />
                  {confirmPassword && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      {passwordsMatch
                        ? <CheckCircle2 size={18} className="text-green-500" />
                        : <AlertCircle size={18} className="text-red-400" />
                      }
                    </span>
                  )}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div role="alert" className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              {/* Role note */}
              <div className="flex items-start gap-2 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg text-slate-600 text-xs leading-relaxed">
                <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
                New accounts are granted Viewer access by default. An admin can upgrade your role later.
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full h-11 mt-1 bg-[#0F2444] hover:bg-[#0a1a2e] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-7">
              Already have an account?{' '}
              <Link href="/login" className="text-[#1a5a8a] font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}