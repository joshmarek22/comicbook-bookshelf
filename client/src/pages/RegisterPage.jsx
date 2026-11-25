import { useState } from 'react'
import { Link } from 'react-router-dom'

function RegisterPage() {
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function submitRegistration(event) {
    event.preventDefault()
    setError('')

    const formData = new FormData(event.currentTarget)
    const password = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (String(password).length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          password,
          confirmPassword,
        }),
      })

      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to create account')
      window.location.replace('/')
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
        <h1 className="mt-10 mb-2 text-[28px]">Create an account</h1>
        <p className="mb-8 text-[var(--muted)]">Start building your comic book shelf.</p>

        <form className="grid gap-5" onSubmit={submitRegistration}>
          <label className="grid gap-2 text-sm" htmlFor="name">
            Name
            <input
              className="h-11 border border-[var(--line)] bg-[#292929] px-3 text-[var(--ink)] outline-offset-2 focus:outline-2 focus:outline-[var(--ink)]"
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
            />
          </label>

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
              autoComplete="new-password"
              minLength="8"
              required
            />
          </label>

          <label className="grid gap-2 text-sm" htmlFor="confirmPassword">
            Confirm password
            <input
              className="h-11 border border-[var(--line)] bg-[#292929] px-3 text-[var(--ink)] outline-offset-2 focus:outline-2 focus:outline-[var(--ink)]"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength="8"
              required
            />
          </label>

          {error && <p className="m-0 text-sm text-red-300" role="alert">{error}</p>}
          <button
            className="h-11 border border-[var(--ink)] bg-[var(--ink)] font-bold text-[#292929] hover:bg-white"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[var(--muted)]">
          Already have an account? <Link className="text-[var(--ink)] underline" to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  )
}

export default RegisterPage
