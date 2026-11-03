import { requestComicVine } from '../config/externalApi.js';

const marvelVolumeCache = new Map();

export async function searchComics({ search, limit, offset }) {
  const matchingVolumes = await getMarvelVolumes(search || 'Marvel');
  const issues = await Promise.all(
    matchingVolumes.slice(0, 12).map(({ id }) => requestComicVine('issues', {
      filter: `volume:${id}`,
      limit: 3,
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

async function getMarvelVolumes(query) {
  const cached = marvelVolumeCache.get(query);
  if (cached && Date.now() - cached.loadedAt < 300000) return cached.volumes;

  const payload = await requestComicVine('search', {
    query,
    resources: 'volume',
    limit: 100,
  });
  const volumes = (payload.results ?? []).filter(({ publisher }) => publisher?.id === 31);
  marvelVolumeCache.set(query, { volumes, loadedAt: Date.now() });
  return volumes;
}

export async function getComicById(id) {
  const payload = await requestComicVine(`issue/4000-${id}`);
  return payload.results ?? null;
}
