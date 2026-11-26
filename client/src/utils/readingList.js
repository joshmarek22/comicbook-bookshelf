const STATUS_SECTIONS = [
  { status: 'want_to_read', label: 'Want to read' },
  { status: 'reading', label: 'Currently reading' },
  { status: 'finished', label: 'Finished' },
]

const titleOrder = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })

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

export function groupItemsByStatus(items) {
  return STATUS_SECTIONS.map(({ status, label }) => {
    const statusItems = items.filter((item) => item.status === status)
    return {
      status,
      label,
      issueCount: statusItems.length,
      groups: groupItems(statusItems),
    }
  })
}
