import { Link } from 'react-router-dom'
import ReadingCard from './ReadingCard'

function CurrentlyReading({ series, isLoading }) {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="mb-4 text-[13px] tracking-[1px]">CURRENTLY READING</h1>
      </div>
      {isLoading && <p className="text-sm text-[var(--muted)]">Loading...</p>}
      {!isLoading && series.length === 0 && (
        <p className="text-sm text-[var(--muted)]">
          Nothing in progress — <Link className="underline" to="/browse">browse comics</Link>
        </p>
      )}
      {series.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {series.map((entry) => <ReadingCard key={entry.id} series={entry} />)}
        </div>
      )}
    </section>
  )
}

export default CurrentlyReading
