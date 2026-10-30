import { Link, NavLink } from 'react-router-dom'

function Header() {
  return (
    <header className="topbar">
      <Link className="wordmark" to="/">PANELHAUS</Link>
      <input aria-label="Search" placeholder="Search series, creators, characters" />
      <nav>
        <NavLink to="/browse">Browse</NavLink>
        <NavLink to="/lists">Lists</NavLink>
        <NavLink to="/reading-orders">Reading orders</NavLink>
      </nav>
      <button className="avatar" aria-label="Open profile">J</button>
    </header>
  )
}

export default Header
