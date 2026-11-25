import { useEffect, useMemo, useState } from 'react'
import Header from '../components/layout/Header'
import VolumeCard from '../components/VolumeCard'

function normalizeVolumeSearch(value) {
  return value
    .replace(/\(\s*by\s+[^)]*\)/gi, ' ')
    .replace(/\b(?:19|20)\d{2}\b/g, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .toLowerCase()
}

function getVolumeSearchScore(volume, query) {
  const searchTitle = normalizeVolumeSearch(query)
  const volumeTitle = normalizeVolumeSearch(volume.name || '')
  const year = query.match(/\b(?:19|20)\d{2}\b/)?.[0]
  let score = year && String(volume.start_year) === year ? 1000 : 0

  if (volumeTitle === searchTitle) score += 100
  else if (volumeTitle.startsWith(searchTitle)) score += 50
  else if (volumeTitle.includes(searchTitle)) score += 25

  return score
}

function BrowsePage() {
  const [volumes, setVolumes] = useState([])
  const [visibleCount, setVisibleCount] = useState(24)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [searchVersion, setSearchVersion] = useState(0)
  const [sort, setSort] = useState('relevance')
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams({ limit: '100' })
    if (query) params.set('search', query)

    fetch(`/api/v1/comics/volumes?${params}`, {
      signal: controller.signal,
      cache: 'no-store',
    })
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load series')
        return response.json()
      })
      .then((payload) => {
        setVolumes(payload.results ?? [])
        setVisibleCount(24)
        setStatus('ready')
      })
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message)
          setStatus('error')
        }
      })

    return () => controller.abort()
  }, [query, searchVersion])

  const visibleVolumes = useMemo(() => {
    if (sort === 'relevance') {
      return volumes
        .map((volume, index) => ({ volume, index }))
        .sort((a, b) => (
          getVolumeSearchScore(b.volume, query) - getVolumeSearchScore(a.volume, query)
          || a.index - b.index
        ))
        .map(({ volume }) => volume)
    }

    return [...volumes].sort((a, b) => {
      if (sort === 'title') return (a.name || '').localeCompare(b.name || '')

      const aYear = Number(a.start_year) || 0
      const bYear = Number(b.start_year) || 0
      return sort === 'oldest' ? aYear - bYear : bYear - aYear
    })
  }, [volumes, query, sort])

  function submitSearch(event) {
    event.preventDefault()
    setStatus('loading')
    setError('')
    setQuery(search.trim())
    setSort('relevance')
    setSearchVersion((version) => version + 1)
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1280px] px-5 py-8 md:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--line)] pb-5">
          <div>
            <p className="mb-2 text-[13px] tracking-[1px]">COMIC VINE COLLECTION</p>
            <h1 className="m-0 text-[28px]">Browse series</h1>
          </div>
          <form className="flex w-full max-w-[420px] gap-2" onSubmit={submitSearch}>
            <label className="sr-only" htmlFor="browse-search">Search series</label>
            <input
              className="h-10 min-w-0 flex-1 border border-[var(--line)] bg-[#333] px-3 text-[var(--ink)] outline-offset-2 focus:outline-2 focus:outline-[var(--ink)]"
              id="browse-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search series"
            />
            <button className="border border-[var(--ink)] bg-[var(--ink)] px-4 text-sm text-[#292929]" type="submit">
              Search
            </button>
          </form>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
            Sort
            <select
              className="h-10 border border-[var(--line)] bg-[#333] px-3 text-[var(--ink)]"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="relevance">Relevance</option>
              <option value="newest">Newest series first</option>
              <option value="oldest">Oldest series first</option>
              <option value="title">Title A-Z</option>
            </select>
          </label>
        </div>

        {status === 'loading' && <p className="text-[var(--muted)]">Loading series...</p>}
        {status === 'error' && <p role="alert">{error}</p>}
        {status === 'ready' && visibleVolumes.length === 0 && (
          <p className="text-[var(--muted)]">No series found.</p>
        )}
        {status === 'ready' && visibleVolumes.length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {visibleVolumes.slice(0, visibleCount).map((volume) => (
              <VolumeCard key={volume.id} volume={volume} />
            ))}
          </div>
        )}
        {status === 'ready' && visibleCount < visibleVolumes.length && (
          <button
            className="mt-8 border border-[var(--ink)] px-5 py-3 text-sm hover:bg-[#333]"
            type="button"
            onClick={() => setVisibleCount((count) => Math.min(count + 24, visibleVolumes.length))}
          >
            View more series
          </button>
        )}
      </main>
    </>
  )
}

export default BrowsePage
