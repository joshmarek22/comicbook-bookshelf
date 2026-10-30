import { Link } from 'react-router-dom'
import { upNext } from '../../data/dashboard'

function RightColumn() {
  return (
    <aside className="grid content-start gap-4 md:col-start-2 md:grid-cols-2 lg:col-start-auto lg:row-auto lg:block">
      <section className="border border-[var(--line)] p-4">
        <h2 className="mb-4 text-[13px] tracking-[1px]">NEW THIS WEDNESDAY</h2>
        <div className="mb-4 grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }, (_, index) => <div className="aspect-[2/3] border border-[var(--line)] bg-[var(--placeholder)]" key={index} />)}
        </div>
        <Link className="underline" to="/calendar">Full release calendar</Link>
      </section>
      <section className="grid gap-4 border border-[var(--line)] p-4">
        <h2 className="mb-0 text-[13px] tracking-[1px]">UP NEXT</h2>
        {upNext.map((title) => <Link className="underline" to="/reading-orders" key={title}>{title}</Link>)}
      </section>
    </aside>
  )
}

export default RightColumn
