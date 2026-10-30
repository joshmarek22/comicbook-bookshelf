import { Link } from 'react-router-dom'
import { shelves } from '../../data/dashboard'

function Sidebar() {
  return (
    <aside className="sidebar">
      <section className="panel">
        <h2>MY SHELVES</h2>
        <ul className="shelf-list">
          {shelves.map(([name, count]) => (
            <li key={name}>
              <Link to={`/shelves/${name.toLowerCase().replaceAll(' ', '-')}`}>{name}</Link>
              <span>{count}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="panel challenge">
        <h2>2026 CHALLENGE</h2>
        <div className="progress"><span style={{ width: '62%' }} /></div>
        <small>62 / 100 issues</small>
      </section>
    </aside>
  )
}

export default Sidebar
