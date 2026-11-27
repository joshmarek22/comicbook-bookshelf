import assert from 'node:assert/strict'
import test from 'node:test'
import { getCurrentlyReading, getShelfCounts, getUpNext } from './dashboard.js'

const items = [
  { id: 1, comic_vine_comic_id: 101, title_snapshot: 'Saga #1', status: 'finished', comic_vine_volume_id: 10, volume_title_snapshot: 'Saga', updated_at: '2026-11-01T00:00:00Z' },
  { id: 2, comic_vine_comic_id: 102, title_snapshot: 'Saga #2', status: 'reading', comic_vine_volume_id: 10, volume_title_snapshot: 'Saga', updated_at: '2026-11-02T00:00:00Z' },
  { id: 3, comic_vine_comic_id: 110, title_snapshot: 'Saga #10', status: 'want_to_read', comic_vine_volume_id: 10, volume_title_snapshot: 'Saga', updated_at: '2026-11-02T00:00:00Z' },
  { id: 4, comic_vine_comic_id: 201, title_snapshot: 'Monstress #1', status: 'reading', comic_vine_volume_id: 20, volume_title_snapshot: 'Monstress', updated_at: '2026-11-20T00:00:00Z' },
  { id: 5, comic_vine_comic_id: 301, title_snapshot: 'Paper Girls #1', status: 'want_to_read', comic_vine_volume_id: 30, volume_title_snapshot: 'Paper Girls', updated_at: '2026-10-01T00:00:00Z' },
  { id: 6, comic_vine_comic_id: 999, title_snapshot: 'Loose issue', status: 'reading', comic_vine_volume_id: null, volume_title_snapshot: null, updated_at: '2026-11-25T00:00:00Z' },
]

test('counts series, not issues, on each shelf and ignores ungrouped issues', () => {
  assert.deepEqual(
    getShelfCounts(items).map(({ label, count }) => [label, count]),
    [['Want to read', 2], ['Reading', 2], ['Finished', 1]],
  )
})

test('builds currently-reading cards with Comic Vine title, cover and progress', () => {
  const cards = getCurrentlyReading(items, {
    10: { name: 'Saga (2012)', count_of_issues: 4, image: { small_url: 'saga.jpg' } },
  })

  assert.deepEqual(cards, [
    { id: 20, title: 'Monstress', imageUrl: null, finished: 0, total: 1, progress: 0 },
    { id: 10, title: 'Saga (2012)', imageUrl: 'saga.jpg', finished: 1, total: 4, progress: 25 },
  ])
})

test('up next picks the lowest-numbered unfinished issue per in-progress series', () => {
  assert.deepEqual(
    getUpNext(items).map(({ seriesTitle, issueTitle }) => [seriesTitle, issueTitle]),
    [['Monstress', 'Monstress #1'], ['Saga', 'Saga #2']],
  )
})
