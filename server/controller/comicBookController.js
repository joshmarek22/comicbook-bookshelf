import { getComicById, searchComics } from '../services/comicVineService.js';

export async function listComics(req, res) {
  const search = getSearch(req.query.search);
  const limit = getNumber(req.query.limit, 20, 1, 100);
  const offset = getNumber(req.query.offset, 0, 0, Number.MAX_SAFE_INTEGER);

  const comics = await searchComics({ search, limit, offset });
  return res.json(comics);
}

export async function getComic(req, res) {
  const id = getNumber(req.params.id, null, 1, Number.MAX_SAFE_INTEGER);
  if (id === null) {
    return res.status(400).json({ error: 'Comic id must be a positive integer' });
  }

  const comic = await getComicById(id);
  if (!comic) return res.status(404).json({ error: 'Comic not found' });

  return res.json(comic);
}

function getSearch(value) {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || value.trim() === '') {
    const error = new Error('search must be a non-empty string');
    error.statusCode = 400;
    throw error;
  }
  return value.trim();
}

function getNumber(value, fallback, minimum, maximum) {
  if (value === undefined && fallback !== null) return fallback;

  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < minimum || number > maximum) {
    const error = new Error(`value must be an integer between ${minimum} and ${maximum}`);
    error.statusCode = 400;
    throw error;
  }
  return number;
}