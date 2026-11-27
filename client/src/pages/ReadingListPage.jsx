import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/layout/Header'
import VolumeCard from '../components/VolumeCard'
import { readJson, useReadingList } from '../hooks/useReadingList'
import { groupItemsByStatus } from '../utils/readingList'

const STATUS_LABELS = {
  want_to_read: 'Want to read',
  reading: 'Reading',
  finished: 'Finished',
}

function getIssueTitle(item) {
  return item.title_snapshot || `Issue #${item.comic_vine_comic_id}`
}

function ReadingListPage() {
  const {
    user,
    items,
    volumeDetails,
    status,
    error,
    detailsError,
    replaceItem,
  } = useReadingList()
  const userId = user?.id
  const { hash } = useLocation()
  const [statusError, setStatusError] = useState('')
  const [updatingItemIds, setUpdatingItemIds] = useState(new Set())

  useEffect(() => {
    if (status !== 'ready' || !hash) return
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView()
  }, [status, hash])

  const sections = groupItemsByStatus(items)

  async function changeItemStatus(item, nextStatus) {
    if (item.status === nextStatus) return

    setStatusError('')
    setUpdatingItemIds((current) => new Set(current).add(item.id))
    try {
      const response = await fetch(
        `/api/v1/users/${userId}/reading-list/${item.comic_vine_comic_id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status: nextStatus }),
        },
      )
      const updatedItem = await readJson(response, 'Unable to update reading status')
      replaceItem(updatedItem)
    } catch (requestError) {
      setStatusError(requestError.message)
    } finally {
      setUpdatingItemIds((current) => {
        const next = new Set(current)
        next.delete(item.id)
        return next
      })
    }
  }

  function renderIssueRows(group) {
    return (
      <ul className="m-0 list-none divide-y divide-[var(--line)] p-0">
        {group.items.map((item) => (
          <li className="py-2" key={item.id}>
            <span className="block truncate text-sm">{getIssueTitle(item)}</span>
            <div
              aria-label={`Reading status for ${getIssueTitle(item)}`}
              className="mt-2 grid grid-cols-3 gap-1"
              role="group"
            >
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <button
                  aria-label={`Set ${label.toLowerCase()} for ${getIssueTitle(item)}`}
                  aria-pressed={item.status === value}
                  className={`h-9 min-w-0 whitespace-nowrap border px-1 text-[10px] leading-tight focus-visible:outline-2 focus-visible:outline-[var(--ink)] ${
                    item.status === value
                      ? 'border-[var(--ink)] bg-[var(--ink)] text-[#292929]'
                      : 'border-[var(--line)] text-[var(--muted)] hover:bg-[#333]'
                  }`}
                  disabled={updatingItemIds.has(item.id)}
                  key={value}
                  onClick={() => changeItemStatus(item, value)}
                  title={label}
                  type="button"
                >
                  {value === 'want_to_read' ? 'Want' : value === 'reading' ? 'Read' : 'Done'}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1280px] px-5 py-8 md:px-8">
        <h1 className="mb-2 mt-0 text-[28px]">My reading list</h1>
        <p className="mb-8 text-sm text-[var(--muted)]">
          Track each saved issue as want to read, currently reading, or finished.
        </p>

        {status === 'loading' && <p className="text-[var(--muted)]">Loading your reading list...</p>}
        {status === 'error' && <p role="alert">{error}</p>}
        {detailsError && <p role="alert">{detailsError}</p>}
        {statusError && <p role="alert">{statusError}</p>}
        {status === 'ready' && sections.map((section) => {
          const volumeGroups = section.groups.filter((group) => group.id != null)
          const ungroupedGroup = section.groups.find((group) => group.id == null)

          return (
            <section className="mt-10 scroll-mt-6 first:mt-0" id={section.status} key={section.status}>
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3 border-b border-[var(--line)] pb-3">
                <h2 className="m-0 text-xl">{section.label}</h2>
                <p className="m-0 text-sm text-[var(--muted)]">
                  {volumeGroups.length} series · {section.issueCount} {section.issueCount === 1 ? 'issue' : 'issues'}
                </p>
              </div>

              {section.issueCount === 0 && (
                <p className="text-sm text-[var(--muted)]">No saved issues in this section.</p>
              )}

              {volumeGroups.length > 0 && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {volumeGroups.map((group) => (
                    <div className="min-w-0" key={group.id}>
                      <VolumeCard
                        volume={{
                          ...(volumeDetails[String(group.id)] || {}),
                          id: group.id,
                          name: volumeDetails[String(group.id)]?.name || group.title,
                        }}
                        detail={`${group.items.length} saved ${group.items.length === 1 ? 'issue' : 'issues'}`}
                      />
                      <details className="mt-2 border-t border-[var(--line)]">
                        <summary className="cursor-pointer py-2 text-xs text-[var(--muted)]">
                          Update issue statuses
                        </summary>
                        {renderIssueRows(group)}
                      </details>
                    </div>
                  ))}
                </div>
              )}

              {ungroupedGroup && (
                <div className="mt-6 border-t border-[var(--line)] pt-4">
                  <h3 className="mb-2 mt-0 text-base">Ungrouped issues</h3>
                  <p className="mb-2 text-sm text-[var(--muted)]">
                    These saved issues predate series grouping.
                  </p>
                  {renderIssueRows(ungroupedGroup)}
                </div>
              )}
            </section>
          )
        })}
      </main>
    </>
  )
}

export default ReadingListPage
