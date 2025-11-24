'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            },
          },
        })

        if (signUpError) {
          setError(signUpError.message)
          setLoading(false)
          return
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          setError(signInError.message)
          setLoading(false)
          return
        }
      }

      // Success - redirect to home
      router.push('/')
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
    setError('')
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="animate-fade-in text-4xl font-bold tracking-tight text-gray-900">
            Welcome to <span className="text-blue-800">Park<span className="text-yellow-500">YYC</span></span>
          </h2>
          <p className="animate-fade-in-delay mt-3 text-gray-600">
            {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        <div className="animate-scale-in mt-8 rounded-lg border-l-4 border-yellow-400 bg-white px-8 py-10 shadow-xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-gray-900">
                  Name
                </label>
                <div className="mt-2">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="focus-glow block w-full appearance-none rounded-lg border-2 border-gray-300 px-4 py-3 placeholder-gray-400 transition-all focus:border-yellow-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Your name"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="focus-glow block w-full appearance-none rounded-lg border-2 border-gray-300 px-4 py-3 placeholder-gray-400 transition-all focus:border-yellow-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-900">
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="focus-glow block w-full appearance-none rounded-lg border-2 border-gray-300 px-4 py-3 placeholder-gray-400 transition-all focus:border-yellow-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="animate-slide-in rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-accent flex w-full justify-center text-lg font-bold uppercase tracking-wide disabled:opacity-50"
              >
                {loading ? 'Loading...' : mode === 'signup' ? 'Sign Up' : 'Log In'}
              </button>
            </div>
          </form>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="text-center">
              <button
                type="button"
                onClick={toggleMode}
                disabled={loading}
                className="font-semibold text-blue-800 transition-colors hover:text-blue-900 hover:underline disabled:text-blue-400 disabled:cursor-not-allowed"
              >
                {mode === 'login'
                  ? "Need an account? Sign up"
                  : "Already have an account? Log in"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
