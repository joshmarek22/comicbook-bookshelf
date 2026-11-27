const titleOrder = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })

export const SHELVES = [
  { status: 'want_to_read', label: 'Want to read' },
  { status: 'reading', label: 'Reading' },
  { status: 'finished', label: 'Finished' },
]

function seriesItems(items) {
  const series = new Map()
  for (const item of items) {
    if (item.comic_vine_volume_id == null) continue
    const key = String(item.comic_vine_volume_id)
    if (!series.has(key)) {
      series.set(key, { id: item.comic_vine_volume_id, title: item.volume_title_snapshot, items: [] })
    }
    series.get(key).items.push(item)
  }
  return [...series.values()]
}

function issueTitle(item) {
  return item.title_snapshot || `Issue #${item.comic_vine_comic_id}`
}

function latestUpdate(group) {
  return Math.max(...group.items.map((item) => new Date(item.updated_at).getTime() || 0))
}

// Number of series with at least one saved issue in each status.
export function getShelfCounts(items) {
  const groups = seriesItems(items)
  return SHELVES.map(({ status, label }) => ({
    status,
    label,
    count: groups.filter((group) => group.items.some((item) => item.status === status)).length,
  }))
}

// Series with an issue in progress, most recently touched first.
export function getCurrentlyReading(items, volumeDetails = {}, limit = 4) {
  return seriesItems(items)
    .filter((group) => group.items.some((item) => item.status === 'reading'))
    .sort((a, b) => latestUpdate(b) - latestUpdate(a))
    .slice(0, limit)
    .map((group) => {
      const details = volumeDetails[String(group.id)] || {}
      const finished = group.items.filter((item) => item.status === 'finished').length
      const seriesTotal = Number(details.count_of_issues)
      const total = Number.isSafeInteger(seriesTotal) && seriesTotal > 0
        ? Math.max(seriesTotal, finished)
        : group.items.length
      return {
        id: group.id,
        title: details.name || group.title || 'Untitled series',
        imageUrl: details.image?.small_url || details.image?.medium_url || null,
        finished,
        total,
        progress: total > 0 ? Math.round((finished / total) * 100) : 0,
      }
    })
}

// First unfinished saved issue for each in-progress series.
export function getUpNext(items, limit = 3) {
  return seriesItems(items)
    .filter((group) => group.items.some((item) => item.status === 'reading'))
    .sort((a, b) => latestUpdate(b) - latestUpdate(a))
    .map((group) => {
      const next = group.items
        .filter((item) => item.status !== 'finished')
        .sort((a, b) => titleOrder.compare(issueTitle(a), issueTitle(b)))[0]
      return next && {
        volumeId: group.id,
        seriesTitle: group.title,
        issueTitle: issueTitle(next),
        key: next.id,
      }
    })
    .filter(Boolean)
    .slice(0, limit)
}
