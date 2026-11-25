import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

function LoginPage() {
  const location = useLocation()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function submitLogin(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const formData = new FormData(event.currentTarget)
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
        }),
      })

      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to sign in')
      window.location.replace(location.state?.from || '/')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <section className="w-full max-w-[440px] border border-[var(--line)] bg-[#333] p-6 sm:p-8">
        <Link className="text-[22px] font-bold tracking-[1px] no-underline" to="/">
          PANELHAUS
        </Link>
        <h1 className="mt-10 mb-2 text-[28px]">Welcome back</h1>
        <p className="mb-8 text-[var(--muted)]">Sign in to manage your comic book shelf.</p>

        <form className="grid gap-5" onSubmit={submitLogin}>
          <label className="grid gap-2 text-sm" htmlFor="email">
            Email
            <input
              className="h-11 border border-[var(--line)] bg-[#292929] px-3 text-[var(--ink)] outline-offset-2 focus:outline-2 focus:outline-[var(--ink)]"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </label>

          <label className="grid gap-2 text-sm" htmlFor="password">
            Password
            <input
              className="h-11 border border-[var(--line)] bg-[#292929] px-3 text-[var(--ink)] outline-offset-2 focus:outline-2 focus:outline-[var(--ink)]"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>

          <div className="flex items-center justify-between gap-4 text-sm">
            <label className="flex items-center gap-2 text-[var(--muted)]" htmlFor="remember">
              <input id="remember" name="remember" type="checkbox" />
              Remember me
            </label>
            <a className="underline" href="#forgot-password">Forgot password?</a>
          </div>

          {error && <p className="m-0 text-sm text-red-300" role="alert">{error}</p>}
          <button
            className="h-11 border border-[var(--ink)] bg-[var(--ink)] font-bold text-[#292929] hover:bg-white"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[var(--muted)]">
          New to Panelhaus? <Link className="text-[var(--ink)] underline" to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  )
}

export default LoginPage
