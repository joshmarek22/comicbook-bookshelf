import { requestComicVine } from '../config/externalApi.js';

export async function searchComics({ search, limit, offset }) {
  const payload = await requestComicVine('search', {
    query: search,
    resources: 'issue',
    limit,
    offset,
    sort: 'date_last_updated:desc',
  });

  return {
    offset: payload.offset,
    limit: payload.limit,
    total: payload.number_of_total_results,
    count: payload.number_of_page_results,
    results: payload.results,
  };
}

export async function getComicById(id) {
  const payload = await requestComicVine(`issue/4000-${id}`);
  return payload.results ?? null;
}
