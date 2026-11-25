import {
  getComicById,
  getVolumeById,
  getVolumeIssues,
  searchComics,
  searchVolumes,
} from '../services/comicVineService.js';
import { findSaveCounts } from '../models/readingListModel.js';

export async function listComics(req, res) {
  const search = getSearch(req.query.search);
  const limit = getNumber(req.query.limit, 20, 1, 120);
  const offset = getNumber(req.query.offset, 0, 0, Number.MAX_SAFE_INTEGER);

  const comics = await searchComics({ search, limit, offset });
  const saveCounts = await findSaveCounts(comics.results.map(({ id }) => id));
  const countsByComicId = new Map(
    saveCounts.map(({ comic_vine_comic_id, save_count }) => [
      String(comic_vine_comic_id),
      save_count,
    ]),
  );

  return res.json({
    ...comics,
    results: comics.results.map((comic) => ({
      ...comic,
      shelf_saves: countsByComicId.get(String(comic.id)) ?? 0,
    })),
  });
}

export async function listVolumes(req, res) {
  const search = getSearch(req.query.search);
  const limit = getNumber(req.query.limit, 24, 1, 100);
  const offset = getNumber(req.query.offset, 0, 0, Number.MAX_SAFE_INTEGER);

  const volumes = await searchVolumes({ search, limit, offset });
  return res.json(volumes);
}

export async function getVolume(req, res) {
  const id = getNumber(req.params.id, null, 1, Number.MAX_SAFE_INTEGER);
  if (id === null) {
    return res.status(400).json({ error: 'Volume id must be a positive integer' });
  }

  const volume = await getVolumeById(id);
  if (!volume) return res.status(404).json({ error: 'Volume not found' });

  return res.json(volume);
}

export async function listVolumeIssues(req, res) {
  const volumeId = getNumber(req.params.id, null, 1, Number.MAX_SAFE_INTEGER);
  if (volumeId === null) {
    return res.status(400).json({ error: 'Volume id must be a positive integer' });
  }

  const limit = getNumber(req.query.limit, 24, 1, 100);
  const offset = getNumber(req.query.offset, 0, 0, Number.MAX_SAFE_INTEGER);

  const issues = await getVolumeIssues({ volumeId, limit, offset });
  return res.json(issues);
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