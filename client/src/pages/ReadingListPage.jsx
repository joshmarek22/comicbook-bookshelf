import { useEffect, useState } from 'react'
import Header from '../components/layout/Header'
import VolumeCard from '../components/VolumeCard'

const STATUS_LABELS = {
  want_to_read: 'Want to read',
  reading: 'Reading',
  finished: 'Finished',
}
const titleOrder = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })

async function readJson(response, fallbackMessage) {
  const payload = await response.json()
  if (!response.ok) throw new Error(payload.error || fallbackMessage)
  return payload
}

function groupItems(items) {
  const groups = new Map()
  for (const item of items) {
    const volumeId = item.comic_vine_volume_id
    const key = volumeId == null ? 'ungrouped' : String(volumeId)
    if (!groups.has(key)) {
      groups.set(key, {
        id: volumeId,
        title: item.volume_title_snapshot || 'Ungrouped issues',
        items: [],
      })
    }
    groups.get(key).items.push(item)
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      items: group.items.sort((a, b) => titleOrder.compare(
        a.title_snapshot || `Issue ${a.comic_vine_comic_id}`,
        b.title_snapshot || `Issue ${b.comic_vine_comic_id}`,
      )),
    }))
    .sort((a, b) => {
      if (a.id == null) return 1
      if (b.id == null) return -1
      return titleOrder.compare(a.title, b.title)
    })
}

function ReadingListPage() {
  const [items, setItems] = useState([])
  const [volumeDetails, setVolumeDetails] = useState({})
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [detailsError, setDetailsError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadList() {
      try {
        const userResponse = await fetch('/api/v1/auth/me', {
          credentials: 'include',
          signal: controller.signal,
        })
        const user = await readJson(userResponse, 'Unable to load your account')
        const listResponse = await fetch(
          `/api/v1/users/${user.id}/reading-list`,
          { credentials: 'include', signal: controller.signal },
        )
        const list = await readJson(listResponse, 'Unable to load your reading list')
        const volumeIds = [...new Set(
          list
            .map((item) => item.comic_vine_volume_id)
            .filter((id) => id != null)
            .map(String),
        )]
        const detailsResults = await Promise.allSettled(volumeIds.map(async (id) => {
          const response = await fetch(`/api/v1/comics/volumes/${id}`, {
            signal: controller.signal,
            cache: 'no-store',
          })
          return readJson(response, 'Unable to load series details')
        }))
        if (controller.signal.aborted) return

        const details = {}
        let failedDetails = false
        detailsResults.forEach((result, index) => {
          if (result.status === 'fulfilled') details[volumeIds[index]] = result.value
          else if (result.reason?.name !== 'AbortError') failedDetails = true
        })

        setItems(list)
        setVolumeDetails(details)
        setDetailsError(failedDetails ? 'Some series artwork or details could not be loaded.' : '')
        setStatus('ready')
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message)
          setStatus('error')
        }
      }
    }

    loadList()
    return () => controller.abort()
  }, [])

  const groups = groupItems(items)

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1280px] px-5 py-8 md:px-8">
        <h1 className="mb-2 mt-0 text-[28px]">My reading list</h1>
        <p className="mb-8 text-sm text-[var(--muted)]">
          Books you add are grouped by series, with each saved issue kept on your shelf.
        </p>

        {status === 'loading' && <p className="text-[var(--muted)]">Loading your reading list...</p>}
        {status === 'error' && <p role="alert">{error}</p>}
        {detailsError && <p role="alert">{detailsError}</p>}
        {status === 'ready' && items.length === 0 && (
          <p className="text-[var(--muted)]">Your reading list is empty. Add a series from Browse.</p>
        )}
        {status === 'ready' && groups.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {groups.filter((group) => group.id != null).map((group) => (
                <VolumeCard
                  key={group.id}
                  volume={{
                    ...(volumeDetails[String(group.id)] || {}),
                    id: group.id,
                    name: volumeDetails[String(group.id)]?.name || group.title,
                  }}
                  detail={`${group.items.length} saved ${group.items.length === 1 ? 'issue' : 'issues'}`}
                />
              ))}
            </div>

            {groups.some((group) => group.id == null) && (
              <section className="mt-10">
                <h2 className="mb-4 text-xl">Ungrouped issues</h2>
                <p className="mb-4 text-sm text-[var(--muted)]">
                  These saved issues predate series grouping. Re-add them from Browse to group them by series.
                </p>
                <ul className="m-0 grid list-none gap-2 border-t border-[var(--line)] p-4">
                  {groups.find((group) => group.id == null).items.map((item) => (
                    <li
                      className="flex flex-wrap items-center justify-between gap-2"
                      key={item.id}
                    >
                      <span>{item.title_snapshot || `Issue #${item.comic_vine_comic_id}`}</span>
                      <span className="text-sm text-[var(--muted)]">
                        {STATUS_LABELS[item.status] || item.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </main>
    </>
  )
}

export default ReadingListPage
