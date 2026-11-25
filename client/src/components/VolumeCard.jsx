import { Link } from 'react-router-dom'

function VolumeCard({ volume, detail }) {
  const subtitle = detail
    ?? (Number(volume.count_of_issues) > 0 ? `${volume.count_of_issues} issues` : '')

  return (
    <article className="min-w-0">
      <Link
        className="block no-underline"
        to={`/browse/volumes/${volume.id}`}
      >
        <div className="aspect-[2/3] overflow-hidden border border-[var(--line)] bg-[var(--placeholder)]">
          {volume.image?.small_url && (
            <img
              className="h-full w-full object-cover"
              src={volume.image.small_url}
              alt={`${volume.name || 'Series'} cover`}
              loading="lazy"
            />
          )}
        </div>
        <h2 className="mb-1 mt-3 truncate text-sm font-normal underline">
          {volume.name || 'Untitled series'}
        </h2>
        <p className="m-0 truncate text-xs text-[var(--muted)]">
          {volume.start_year || 'Year unknown'}
          {subtitle && ` · ${subtitle}`}
        </p>
      </Link>
    </article>
  )
}

export default VolumeCard
