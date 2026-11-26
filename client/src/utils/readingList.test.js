import assert from 'node:assert/strict'
import test from 'node:test'
import { groupItemsByStatus } from './readingList.js'

test('groups saved issues into their individual reading statuses', () => {
  const sections = groupItemsByStatus([
    { id: 1, status: 'reading', comic_vine_volume_id: 10, volume_title_snapshot: 'Series A' },
    { id: 2, status: 'finished', comic_vine_volume_id: 10, volume_title_snapshot: 'Series A' },
    { id: 3, status: 'want_to_read', comic_vine_volume_id: null },
  ])

  assert.deepEqual(
    sections.map(({ label, issueCount, groups }) => ({
      label,
      issueCount,
      groupTitles: groups.map((group) => group.title),
      groupIssueCounts: groups.map((group) => group.items.length),
    })),
    [
      { label: 'Want to read', issueCount: 1, groupTitles: ['Ungrouped issues'], groupIssueCounts: [1] },
      { label: 'Currently reading', issueCount: 1, groupTitles: ['Series A'], groupIssueCounts: [1] },
      { label: 'Finished', issueCount: 1, groupTitles: ['Series A'], groupIssueCounts: [1] },
    ],
  )
})
