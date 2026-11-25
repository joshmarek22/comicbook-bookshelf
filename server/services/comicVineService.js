import { requestComicVine } from '../config/externalApi.js';

const volumeSearchCache = new Map();
const volumeIssueCache = new Map();
const issueNumberOrder = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

export async function searchComics({ search, limit, offset }) {
  const matchingVolumes = await getVolumes(search || 'Marvel');
  // shortcut: browse fetches 10 issues from at most 12 volumes; use Comic Vine pagination for larger catalogs.
  const issues = await Promise.all(
    matchingVolumes.slice(0, 12).map(({ id }) => requestComicVine('issues', {
      filter: `volume:${id}`,
      limit: 10,
      sort: 'date_last_updated:desc',
    })),
  );
  const results = issues.flatMap(({ results: volumeIssues }) => volumeIssues);
  results.sort((a, b) => new Date(b.date_last_updated) - new Date(a.date_last_updated));
  const page = results.slice(offset, offset + limit);

  return {
    offset,
    limit,
    total: results.length,
    count: page.length,
    results: page,
  };
}

export async function searchVolumes({ search, limit, offset }) {
  const volumes = await getVolumes(search || 'Marvel');
  const results = volumes.slice(offset, offset + limit);

  return {
    offset,
    limit,
    total: volumes.length,
    count: results.length,
    results,
  };
}

export async function getVolumeById(id) {
  const payload = await requestComicVine(`volume/4050-${id}`);
  return payload.results ?? null;
}

export async function getVolumeIssues({ volumeId, limit, offset }) {
  const issues = await getAllVolumeIssues(volumeId);
  const sortedIssues = [...issues].sort((a, b) => (
    issueNumberOrder.compare(String(a.issue_number ?? ''), String(b.issue_number ?? ''))
  ));
  const results = sortedIssues.slice(offset, offset + limit);

  return {
    offset,
    limit,
    total: sortedIssues.length,
    count: results.length,
    results,
  };
}

async function fetchVolumeIssuePage({ volumeId, limit, offset }) {
  const payload = await requestComicVine('issues', {
    filter: `volume:${volumeId}`,
    limit,
    offset,
    sort: 'issue_number:asc',
  });
  const results = payload.results ?? [];
  const total = Number(payload.number_of_total_results);

  return {
    total: Number.isSafeInteger(total) ? total : results.length,
    results,
  };
}

export async function getAllVolumeIssues(volumeId) {
  const cached = volumeIssueCache.get(volumeId);
  if (cached && Date.now() - cached.loadedAt < 300000) return cached.issues;

  const limit = 100;
  const firstPage = await fetchVolumeIssuePage({ volumeId, limit, offset: 0 });
  const issues = [...firstPage.results];

  for (let offset = issues.length; offset < firstPage.total;) {
    const page = await fetchVolumeIssuePage({ volumeId, limit, offset });
    if (page.results.length === 0) break;
    issues.push(...page.results);
    offset += page.results.length;
  }

  volumeIssueCache.set(volumeId, { issues, loadedAt: Date.now() });
  return issues;
}

async function getVolumes(query) {
  const cached = volumeSearchCache.get(query);
  if (cached && Date.now() - cached.loadedAt < 300000) return cached.volumes;

  // shortcut: browse caches the first 100 volume matches; add provider pagination for deeper catalogs.
  const payload = await requestComicVine('search', {
    query,
    resources: 'volume',
    limit: 100,
  });
  const volumes = payload.results ?? [];
  volumeSearchCache.set(query, { volumes, loadedAt: Date.now() });
  return volumes;
}

export async function getComicById(id) {
  const payload = await requestComicVine(`issue/4000-${id}`);
  return payload.results ?? null;
}
