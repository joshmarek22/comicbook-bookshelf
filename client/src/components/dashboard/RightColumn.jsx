import { Link } from 'react-router-dom'

function RightColumn({ upNext, isLoading }) {
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
        {isLoading && <p className="m-0 text-sm text-[var(--muted)]">Loading...</p>}
        {!isLoading && upNext.length === 0 && (
          <p className="m-0 text-sm text-[var(--muted)]">Start a series to see what's next.</p>
        )}
        {upNext.map(({ key, volumeId, seriesTitle, issueTitle }) => (
          <Link className="min-w-0" to={`/browse/volumes/${volumeId}`} key={key}>
            <span className="block truncate underline">{issueTitle}</span>
            <small className="block truncate text-xs text-[var(--muted)]">{seriesTitle}</small>
          </Link>
        ))}
      </section>
    </aside>
  )
}

export default RightColumn
