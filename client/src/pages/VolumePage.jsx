import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import Header from '../components/layout/Header'

const ISSUE_PAGE_SIZE = 24

function getIssueTitle(issue, volume) {
  return issue.name
    || `${volume.name || 'Series'}${issue.issue_number ? ` #${issue.issue_number}` : ''}`
}

async function readJson(response, fallbackMessage) {
  const payload = await response.json()
  if (!response.ok) throw new Error(payload.error || fallbackMessage)
  return payload
}

function VolumePage() {
  const location = useLocation()
  const { volumeId } = useParams()
  const [volume, setVolume] = useState(null)
  const [issues, setIssues] = useState([])
  const [total, setTotal] = useState(0)
  const [user, setUser] = useState(null)
  const [selectedIssues, setSelectedIssues] = useState(new Map())
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    Promise.all([
      fetch(`/api/v1/comics/volumes/${volumeId}`, {
        signal: controller.signal,
        cache: 'no-store',
      }),
      fetch(`/api/v1/comics/volumes/${volumeId}/issues?limit=${ISSUE_PAGE_SIZE}&offset=0`, {
        signal: controller.signal,
        cache: 'no-store',
      }),
      fetch('/api/v1/auth/me', {
        credentials: 'include',
        signal: controller.signal,
      }),
    ])
      .then(async ([volumeResponse, issuesResponse, userResponse]) => {
        const [volumePayload, issuesPayload, userPayload] = await Promise.all([
          readJson(volumeResponse, 'Unable to load this series'),
          readJson(issuesResponse, 'Unable to load issues'),
          userResponse.status === 401
            ? null
            : readJson(userResponse, 'Unable to load your account'),
        ])
        setVolume(volumePayload)
        setIssues(issuesPayload.results ?? [])
        setTotal(issuesPayload.total ?? 0)
        setUser(userPayload)
        setStatus('ready')
      })
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message)
          setStatus('error')
        }
      })

    return () => controller.abort()
  }, [volumeId])

  async function loadMoreIssues() {
    setIsLoadingMore(true)
    setError('')
    try {
      const response = await fetch(
        `/api/v1/comics/volumes/${volumeId}/issues?limit=${ISSUE_PAGE_SIZE}&offset=${issues.length}`,
        { cache: 'no-store' },
      )
      const payload = await readJson(response, 'Unable to load more issues')
      setIssues((current) => [...current, ...(payload.results ?? [])])
      setTotal(payload.total ?? total)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoadingMore(false)
    }
  }

  function toggleIssue(issue) {
    setSelectedIssues((current) => {
      const next = new Map(current)
      if (next.has(issue.id)) next.delete(issue.id)
      else next.set(issue.id, issue)
      return next
    })
  }

  async function saveIssues(url, body) {
    setIsSaving(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        credentials: 'include',
        body: body ? JSON.stringify(body) : undefined,
      })
      const payload = await readJson(response, 'Unable to add issues')
      setMessage(`${payload.added} added; ${payload.skipped} already on your shelf.`)
      setSelectedIssues(new Map())
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSaving(false)
    }
  }

  function addEntireVolume() {
    return saveIssues(
      `/api/v1/users/${user.id}/reading-list/volumes/${volumeId}`,
      { volumeTitle: volume.name || `Volume ${volumeId}` },
    )
  }

  function addSelectedIssues() {
    const selected = [...selectedIssues.values()]
      .map((issue) => ({
        comicVineComicId: issue.id,
        title: getIssueTitle(issue, volume),
        volumeId: Number(volumeId),
        volumeTitle: volume.name || `Volume ${volumeId}`,
      }))

    return saveIssues(
      `/api/v1/users/${user.id}/reading-list/bulk`,
      { items: selected },
    )
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1280px] px-5 py-8 md:px-8">
        <Link className="text-sm underline" to="/browse">Back to browse</Link>

        {status === 'loading' && <p className="mt-8 text-[var(--muted)]">Loading series...</p>}
        {status === 'error' && <p className="mt-8" role="alert">{error}</p>}

        {status === 'ready' && volume && (
          <>
            <section className="my-8 flex flex-wrap gap-6 border-b border-[var(--line)] pb-8">
              <div className="aspect-[2/3] w-36 shrink-0 overflow-hidden border border-[var(--line)] bg-[var(--placeholder)] sm:w-48">
                {volume.image?.small_url && (
                  <img
                    className="h-full w-full object-cover"
                    src={volume.image.small_url}
                    alt={`${volume.name || 'Series'} cover`}
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-2 text-[13px] tracking-[1px]">SERIES</p>
                <h1 className="mb-2 mt-0 text-[28px]">{volume.name || 'Untitled series'}</h1>
                <p className="mb-6 text-sm text-[var(--muted)]">
                  {volume.start_year || 'Year unknown'} · {total} issues
                </p>
                {user ? (
                  <div className="flex flex-wrap gap-3">
                    <button
                      className="h-11 border border-[var(--ink)] bg-[var(--ink)] px-4 font-bold text-[#292929] hover:bg-white"
                      disabled={isSaving || total === 0}
                      onClick={addEntireVolume}
                      type="button"
                    >
                      {isSaving ? 'Adding...' : 'Add entire book'}
                    </button>
                    <button
                      className="h-11 border border-[var(--line)] px-4 disabled:opacity-50"
                      disabled={isSaving || selectedIssues.size === 0}
                      onClick={addSelectedIssues}
                      type="button"
                    >
                      Add selected issues ({selectedIssues.size})
                    </button>
                  </div>
                ) : (
                  <Link
                    className="inline-block border border-[var(--ink)] px-4 py-3 text-sm underline"
                    to="/login"
                    state={{ from: location.pathname }}
                  >
                    Sign in to add to your shelf
                  </Link>
                )}
              </div>
            </section>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="m-0 text-xl">Issues</h2>
              <p className="m-0 text-sm text-[var(--muted)]">
                Showing {issues.length} of {total}
              </p>
            </div>

            {issues.length === 0 && <p className="text-[var(--muted)]">No issues found.</p>}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {issues.map((issue) => (
                <label
                  className="flex min-w-0 items-center gap-3 border border-[var(--line)] bg-[#333] p-3"
                  key={issue.id}
                >
                  <input
                    checked={selectedIssues.has(issue.id)}
                    onChange={() => toggleIssue(issue)}
                    type="checkbox"
                  />
                  {issue.image?.small_url && (
                    <img
                      className="h-16 w-11 shrink-0 object-cover"
                      src={issue.image.small_url}
                      alt=""
                      loading="lazy"
                    />
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-sm">{getIssueTitle(issue, volume)}</span>
                    <span className="block text-xs text-[var(--muted)]">
                      {issue.cover_date || 'Date unknown'}
                    </span>
                  </span>
                </label>
              ))}
            </div>

            {issues.length < total && (
              <button
                className="mt-6 border border-[var(--ink)] px-5 py-3 text-sm hover:bg-[#333]"
                disabled={isLoadingMore}
                onClick={loadMoreIssues}
                type="button"
              >
                {isLoadingMore ? 'Loading issues...' : 'View more issues'}
              </button>
            )}
          </>
        )}

        {error && status === 'ready' && <p className="mt-4" role="alert">{error}</p>}
        {message && <p className="mt-4" role="status">{message}</p>}
      </main>
    </>
  )
}

export default VolumePage
