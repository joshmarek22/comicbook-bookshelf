import { Link } from 'react-router-dom'

function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <section className="w-full max-w-[440px] border border-[var(--line)] bg-[#333] p-6 sm:p-8">
        <Link className="text-[22px] font-bold tracking-[1px] no-underline" to="/">
          PANELHAUS
        </Link>
        <h1 className="mt-10 mb-2 text-[28px]">Welcome back</h1>
        <p className="mb-8 text-[var(--muted)]">Sign in to manage your comic book shelf.</p>

        <form className="grid gap-5">
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

          <button
            className="h-11 border border-[var(--ink)] bg-[var(--ink)] font-bold text-[#292929] hover:bg-white"
            type="submit"
          >
            Sign in
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[var(--muted)]">
          New to Panelhaus? <a className="text-[var(--ink)] underline" href="#create-account">Create an account</a>
        </p>
      </section>
    </main>
  )
}

export default LoginPage
