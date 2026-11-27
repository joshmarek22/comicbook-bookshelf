import { Link } from 'react-router-dom'

function ReadingCard({ series }) {
  const { id, title, imageUrl, finished, total, progress } = series

  return (
    <article className="min-w-0">
      <Link className="block no-underline" to={`/browse/volumes/${id}`}>
        <div className="aspect-[2/3] overflow-hidden border border-[var(--line)] bg-[var(--placeholder)] sm:aspect-auto sm:h-[233px]">
          {imageUrl && (
            <img className="h-full w-full object-cover" src={imageUrl} alt={`${title} cover`} loading="lazy" />
          )}
        </div>
        <p className="my-3 truncate text-[13px] underline" title={title}>{title}</p>
      </Link>
      <div
        className="h-2 bg-[#4a4a4a]"
        role="progressbar"
        aria-label={`${title} progress`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <span className="block h-full bg-[var(--ink)]" style={{ width: `${progress}%` }} />
      </div>
      <small className="mt-2 block text-xs text-[var(--muted)]">{finished} of {total} read</small>
    </article>
  )
}

export default ReadingCard
