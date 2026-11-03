import { useEffect, useState } from 'react'
import Header from '../components/layout/Header'

function getComicTitle(comic) {
  if (comic.name) return comic.name

  const reprint = comic.description?.match(/Reprints:\s*([^<]+)/i)?.[1]?.trim()
  if (reprint) return reprint

  return `${comic.volume?.name || 'Comic'}${comic.issue_number ? ` #${comic.issue_number}` : ''}`
}

function BrowsePage() {
  const [comics, setComics] = useState([])
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams({ limit: '24' })
    if (query) params.set('search', query)

    fetch(`/api/v1/comics?${params}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load comics')
        return response.json()
      })
      .then((payload) => {
        setComics(payload.results ?? [])
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

        {status === 'loading' && <p className="text-[var(--muted)]">Loading comics...</p>}
        {status === 'error' && <p role="alert">{error}</p>}
        {status === 'ready' && comics.length === 0 && <p className="text-[var(--muted)]">No comics found.</p>}
        {status === 'ready' && comics.length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {comics.map((comic) => (
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
