import { useEffect, useMemo, useState } from 'react'
import Header from '../components/layout/Header'

function getComicTitle(comic) {
  if (comic.name) return comic.name

  const reprint = comic.description?.match(/Reprints:\s*([^<]+)/i)?.[1]?.trim()
  if (reprint) return reprint

  return `${comic.volume?.name || 'Comic'}${comic.issue_number ? ` #${comic.issue_number}` : ''}`
}

function getCredits(comic, type) {
  return Array.isArray(comic[type]) ? comic[type] : []
}

function shuffleComics(comics) {
  const shuffled = [...comics]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}

function BrowsePage() {
  const [comics, setComics] = useState([])
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('newest')
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams({ limit: '100' })
    if (query) params.set('search', query)

    fetch(`/api/v1/comics?${params}`, { signal: controller.signal, cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load comics')
        return response.json()
      })
      .then((payload) => {
        setComics(shuffleComics(payload.results ?? []).slice(0, 24))
        setStatus('ready')
      })
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message)
          setStatus('error')
        }
      })

    return () => controller.abort()
  }, [query])

  const visibleComics = useMemo(() => {
    const filtered = comics.filter((comic) => {
      const characters = getCredits(comic, 'character_credits')
      const teams = getCredits(comic, 'team_credits')

      if (filter === 'superheroes') return characters.length > 0
      if (filter === 'teams') return teams.length > 0
      if (filter === 'teamups') return characters.length > 1 || teams.length > 0
      return true
    })

    return [...filtered].sort((a, b) => {
      if (sort === 'title') return getComicTitle(a).localeCompare(getComicTitle(b))

      const aDate = new Date(a.date_last_updated || 0).getTime()
      const bDate = new Date(b.date_last_updated || 0).getTime()
      return sort === 'oldest' ? aDate - bDate : bDate - aDate
    })
  }, [comics, filter, sort])

  function submitSearch(event) {
    event.preventDefault()
    setStatus('loading')
    setError('')
    setQuery(search.trim())
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1280px] px-5 py-8 md:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--line)] pb-5">
          <div>
            <p className="mb-2 text-[13px] tracking-[1px]">COMIC VINE COLLECTION</p>
            <h1 className="m-0 text-[28px]">Browse comics</h1>
          </div>
          <form className="flex w-full max-w-[420px] gap-2" onSubmit={submitSearch}>
            <label className="sr-only" htmlFor="browse-search">Search comics</label>
            <input
              className="h-10 min-w-0 flex-1 border border-[var(--line)] bg-[#333] px-3 text-[var(--ink)] outline-offset-2 focus:outline-2 focus:outline-[var(--ink)]"
              id="browse-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search comics"
            />
            <button className="border border-[var(--ink)] bg-[var(--ink)] px-4 text-sm text-[#292929]" type="submit">
              Search
            </button>
          </form>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
            Filter
            <select
              className="h-10 border border-[var(--line)] bg-[#333] px-3 text-[var(--ink)]"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="all">All comics</option>
              <option value="superheroes">Superheroes</option>
              <option value="teams">Teams</option>
              <option value="teamups">Team-ups</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
            Sort
            <select
              className="h-10 border border-[var(--line)] bg-[#333] px-3 text-[var(--ink)]"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title">Title A-Z</option>
            </select>
          </label>
        </div>

        {status === 'loading' && <p className="text-[var(--muted)]">Loading comics...</p>}
        {status === 'error' && <p role="alert">{error}</p>}
        {status === 'ready' && visibleComics.length === 0 && <p className="text-[var(--muted)]">No comics found.</p>}
        {status === 'ready' && visibleComics.length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {visibleComics.map((comic) => (
              <article key={comic.id} className="min-w-0">
                <div className="aspect-[2/3] overflow-hidden border border-[var(--line)] bg-[var(--placeholder)]">
                  {comic.image?.small_url && (
                    <img
                      className="h-full w-full object-cover"
                      src={comic.image.small_url}
                      alt={`${getComicTitle(comic)} cover`}
                      loading="lazy"
                    />
                  )}
                </div>
                <h2 className="mb-1 mt-3 truncate text-sm font-normal">{getComicTitle(comic)}</h2>
                <p className="m-0 truncate text-xs text-[var(--muted)]">
                  {comic.volume?.name || 'Comic Vine'}{comic.issue_number ? ` #${comic.issue_number}` : ''}
                </p>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  )
}

export default BrowsePage
