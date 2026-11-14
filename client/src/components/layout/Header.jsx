import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

function Header() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [profileInitial, setProfileInitial] = useState('J')
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  useEffect(() => {
    fetch('/api/v1/auth/me', { credentials: 'include' })
      .then((response) => response.ok ? response.json() : null)
      .then((user) => {
        setUser(user)
        const firstName = user?.name?.trim().split(/\s+/)[0]
        if (firstName) setProfileInitial(firstName[0].toUpperCase())
      })
      .catch(() => {})
  }, [])

  async function signOut() {
    await fetch('/api/v1/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
    navigate('/login', { replace: true })
  }

  return (
    <header className="flex min-h-16 flex-wrap items-center gap-3 border-b-2 border-[var(--ink)] px-5 py-3 md:gap-6 md:px-8">
      <Link className="whitespace-nowrap text-[22px] font-bold tracking-[1px] no-underline" to="/">PANELHAUS</Link>
      <input className="order-3 h-10 min-w-[120px] basis-full border border-[var(--line)] bg-[#333] px-3 text-[var(--ink)] outline-offset-2 focus:outline-2 focus:outline-[var(--ink)] md:order-none md:min-w-0 md:flex-1 md:basis-auto" aria-label="Search" placeholder="Search series, creators, characters" />
      <nav className="ml-auto flex gap-3 whitespace-nowrap text-[13px] md:gap-6 md:text-base">
        <NavLink className={({ isActive }) => isActive ? 'underline' : 'no-underline'} to="/browse">Browse</NavLink>
        <NavLink className={({ isActive }) => isActive ? 'underline' : 'no-underline'} to="/lists">Lists</NavLink>
        <NavLink className={({ isActive }) => isActive ? 'underline' : 'no-underline'} to="/reading-orders">Reading orders</NavLink>
      </nav>
      <div className="relative">
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-[#444] text-[var(--ink)]"
          aria-expanded={isProfileOpen}
          aria-label="Open profile menu"
          type="button"
          onClick={() => setIsProfileOpen((open) => !open)}
        >
          {profileInitial}
        </button>
        {isProfileOpen && (
          <div className="absolute right-0 top-12 z-10 grid min-w-56 gap-3 border border-[var(--line)] bg-[#333] p-4 shadow-lg">
            <div>
              <p className="m-0 font-bold">{user?.name || 'Profile'}</p>
              {user?.email && <p className="m-0 text-xs text-[var(--muted)]">{user.email}</p>}
            </div>
            <Link className="underline" to="/profile" onClick={() => setIsProfileOpen(false)}>Profile</Link>
            <button className="text-left underline" type="button" onClick={signOut}>Sign out</button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
