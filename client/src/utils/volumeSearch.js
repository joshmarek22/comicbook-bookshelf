function normalizeVolumeSearch(value) {
  return value
    .replace(/\(\s*by\s+[^)]*\)/gi, ' ')
    .replace(/\b(?:19|20)\d{2}\b/g, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .toLowerCase()
    .replace(/^(?:the|a|an)\s+/, '')
}

function getTitleMatchRank(volumeTitle, searchTitle) {
  if (volumeTitle === searchTitle) return 0
  if (volumeTitle.startsWith(searchTitle)) return 1
  if (volumeTitle.includes(searchTitle)) return 2
  return 3
}

export function filterAdultVolumes(volumes) {
  return volumes.filter((volume) => {
    const aliases = Array.isArray(volume.aliases) ? volume.aliases : [volume.aliases]
    const titles = [volume.name, ...aliases]
      .filter((value) => typeof value === 'string')
      .join(' ')
    const metadata = [titles, volume.deck, volume.description]
      .filter((value) => typeof value === 'string')
      .join(' ')

    return !/\bsex\b/i.test(titles) && !/\b(?:nude|nudity)\b/i.test(metadata)
  })
}

export function filterVolumesBySearch(volumes, query) {
  const searchTitle = normalizeVolumeSearch(query)
  if (!searchTitle) return [...volumes]

  return volumes.filter((volume) => (
    getTitleMatchRank(
      normalizeVolumeSearch(volume.name || ''),
      searchTitle,
    ) < 3
  ))
}

export function rankVolumes(volumes, query) {
  const searchTitle = normalizeVolumeSearch(query)
  if (!searchTitle) return [...volumes]

  const year = query.match(/\b(?:19|20)\d{2}\b/)?.[0]

  return volumes
    .map((volume, index) => {
      const titleRank = getTitleMatchRank(
        normalizeVolumeSearch(volume.name || ''),
        searchTitle,
      )
      const issueCount = Number(volume.count_of_issues) || 0

      return {
        volume,
        index,
        titleRank,
        issueCount,
        yearRank: year && String(volume.start_year) === year ? 0 : 1,
        group: titleRank === 3 ? 3 : issueCount > 1
          ? titleRank === 0 ? 0 : 1
          : 2,
      }
    })
    .sort((a, b) => (
      a.group - b.group
      || (a.group === 0 && a.yearRank - b.yearRank)
      || (a.group === 0 && b.issueCount - a.issueCount)
      || ((a.group === 1 || a.group === 2) && a.titleRank - b.titleRank)
      || ((a.group === 1 || a.group === 2) && b.issueCount - a.issueCount)
      || a.index - b.index
    ))
    .map(({ volume }) => volume)
}
