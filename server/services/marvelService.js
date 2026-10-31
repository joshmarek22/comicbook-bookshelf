import { requestMarvel } from '../config/externalApi.js';

export async function searchComics({ search, limit, offset }) {
  const payload = await requestMarvel('comics', {
    titleStartsWith: search || undefined,
    orderBy: '-modified',
    limit,
    offset,
  });

  return {
    offset: payload.data.offset,
    limit: payload.data.limit,
    total: payload.data.total,
    count: payload.data.count,
    results: payload.data.results,
  };
}

export async function getComicById(id) {
  const payload = await requestMarvel(`comics/${id}`);
  return payload.data.results[0] ?? null;
}
