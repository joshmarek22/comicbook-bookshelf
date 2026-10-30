import { Link } from 'react-router-dom'
import { shelves } from '../../data/dashboard'

function Sidebar() {
  return (
    <aside className="mb-6 grid grid-cols-2 gap-3 md:mb-0 md:block">
      <section className="border border-[var(--line)] p-4">
        <h2 className="mb-4 text-[13px] tracking-[1px]">MY SHELVES</h2>
        <ul className="m-0 list-none p-0">
          {shelves.map(([name, count]) => (
            <li className="mb-4 flex justify-between last:mb-0" key={name}>
              <Link className="underline" to={`/shelves/${name.toLowerCase().replaceAll(' ', '-')}`}>{name}</Link>
              <span>{count}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-4 border border-[var(--line)] p-4 max-md:mt-0">
        <h2 className="mb-[10px] text-[13px] tracking-[1px]">2026 CHALLENGE</h2>
        <div className="h-2 bg-[#4a4a4a]"><span className="block h-full bg-[var(--ink)]" style={{ width: '62%' }} /></div>
        <small className="text-xs text-[var(--muted)]">62 / 100 issues</small>
      </section>
    </aside>
  )
}

export default Sidebar
