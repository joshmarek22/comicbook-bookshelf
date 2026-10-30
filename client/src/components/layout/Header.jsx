import { Link, NavLink } from 'react-router-dom'

function Header() {
  return (
    <header className="flex min-h-16 flex-wrap items-center gap-3 border-b-2 border-[var(--ink)] px-5 py-3 md:gap-6 md:px-8">
      <Link className="whitespace-nowrap text-[22px] font-bold tracking-[1px] no-underline" to="/">PANELHAUS</Link>
      <input className="order-3 h-10 min-w-[120px] basis-full border border-[var(--line)] bg-[#333] px-3 text-[var(--ink)] outline-offset-2 focus:outline-2 focus:outline-[var(--ink)] md:order-none md:min-w-0 md:flex-1 md:basis-auto" aria-label="Search" placeholder="Search series, creators, characters" />
      <nav className="ml-auto flex gap-3 whitespace-nowrap text-[13px] md:gap-6 md:text-base">
        <NavLink className={({ isActive }) => isActive ? 'underline' : 'no-underline'} to="/browse">Browse</NavLink>
        <NavLink className={({ isActive }) => isActive ? 'underline' : 'no-underline'} to="/lists">Lists</NavLink>
        <NavLink className={({ isActive }) => isActive ? 'underline' : 'no-underline'} to="/reading-orders">Reading orders</NavLink>
      </nav>
      <button className="h-9 w-9 rounded-full border border-[var(--line)] bg-[#444] text-[var(--ink)]" aria-label="Open profile">J</button>
    </header>
  )
}

export default Header
