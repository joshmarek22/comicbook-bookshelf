import assert from 'node:assert/strict'
import test from 'node:test'
import {
  filterAdultVolumes,
  filterVolumesBySearch,
  rankVolumes,
} from './volumeSearch.js'

test('filters volumes mentioning nude or nudity in their metadata', () => {
  const volumes = [
    { id: 'title', name: 'Nude Art Collection' },
    { id: 'description', name: 'Adult Comics', description: 'Contains nudity.' },
    { id: 'alias', name: 'Indie Series', aliases: ['Nude Stories'] },
    { id: 'sex-title', name: 'Sex Infinity', description: 'French translation of an ero-manga.' },
    { id: 'safe', name: 'Heroic Tales', description: 'The hero was denuded of armor.' },
  ]

  assert.deepEqual(
    filterAdultVolumes(volumes).map(({ id }) => id),
    ['safe'],
  )
})

test('excludes unrelated titles from search results', () => {
  const volumes = [
    { id: 'exact', name: 'The Infinity Gauntlet' },
    { id: 'related', name: 'The Infinity Gauntlet: Warzones!' },
    { id: 'phrase', name: 'Avengers and the Infinity Gauntlet' },
    { id: 'unrelated', name: 'The Gauntlet' },
  ]

  assert.deepEqual(
    filterVolumesBySearch(volumes, 'The Infinity Gauntlet').map(({ id }) => id),
    ['exact', 'related', 'phrase'],
  )
})

test('ranks exact and complete series ahead of one-issue related editions', () => {
  const volumes = [
    { id: 'warzones', name: 'The Infinity Gauntlet: Warzones!', count_of_issues: 1 },
    { id: 'modern', name: 'The Infinity Gauntlet', start_year: '2015', count_of_issues: 5 },
    { id: 'avengers', name: 'Avengers and the Infinity Gauntlet', count_of_issues: 4 },
    { id: 'classic', name: 'The Infinity Gauntlet', start_year: '1991', count_of_issues: 6 },
    { id: 'reprint', name: 'Infinity Gauntlet', count_of_issues: 1 },
    { id: 'deluxe', name: 'The Infinity Gauntlet: Deluxe Edition', count_of_issues: 1 },
  ]

  assert.deepEqual(
    rankVolumes(volumes, 'The Infinity Gauntlet').map(({ id }) => id),
    ['classic', 'modern', 'avengers', 'reprint', 'warzones', 'deluxe'],
  )
})

test('prioritizes an explicitly requested year among exact title matches', () => {
  const volumes = [
    { id: 'classic', name: 'The Infinity Gauntlet', start_year: '1991', count_of_issues: 6 },
    { id: 'modern', name: 'The Infinity Gauntlet', start_year: '2015', count_of_issues: 5 },
  ]

  assert.deepEqual(
    rankVolumes(volumes, 'The Infinity Gauntlet 2015').map(({ id }) => id),
    ['modern', 'classic'],
  )
})

test('keeps an explicitly searched one-issue edition at the top', () => {
  const volumes = [
    { id: 'classic', name: 'The Infinity Gauntlet', count_of_issues: 6 },
    { id: 'deluxe', name: 'The Infinity Gauntlet: Deluxe Edition', count_of_issues: 1 },
  ]

  assert.deepEqual(
    rankVolumes(volumes, 'The Infinity Gauntlet Deluxe Edition').map(({ id }) => id),
    ['deluxe', 'classic'],
  )
})
