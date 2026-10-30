import { recentActivity } from '../../data/dashboard'

function RecentActivity() {
  return (
    <section className="mt-[42px]">
      <h1 className="mb-4 text-[13px] tracking-[1px]">YOUR RECENT ACTIVITY</h1>
      <div className="grid gap-3">
        {recentActivity.map(([title, detail]) => (
          <article className="flex min-h-[72px] items-center gap-8 border border-[var(--line)] px-5 py-4" key={title}>
            <div className="h-10 w-10 shrink-0 rounded-full border border-[var(--line)] bg-[#444]" />
            <div>
              <p className="mb-0.5 text-sm">{title}</p>
              {detail && <small className="text-xs text-[var(--muted)]">{detail}</small>}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default RecentActivity
