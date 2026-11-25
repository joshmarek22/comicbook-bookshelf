import {
  addItem,
  addItems,
  findByUserId,
  removeItem,
  updateStatus,
} from '../models/readingListModel.js';
import { getAllVolumeIssues } from '../services/comicVineService.js';

const STATUSES = new Set(['want_to_read', 'reading', 'finished']);

// GET /api/v1/users/:userId/reading-list
export async function getReadingList(req, res) {
  const userId = getPositiveInteger(req.params.userId, res, 'User id');
  if (userId === null) return;

  const requestedStatus = req.query.status;
  const status = requestedStatus === 'completed' ? 'finished' : requestedStatus;

  if (status !== undefined && !STATUSES.has(status)) {
    return res.status(400).json({
      error: 'status must be want_to_read, reading, finished, or completed',
    });
  }

  const items = await findByUserId(userId, status);
  return res.json(items);
}

// POST /api/v1/users/:userId/reading-list
export async function addReadingListItem(req, res) {
  const userId = getPositiveInteger(req.params.userId, res, 'User id');
  if (userId === null) return;

  const comicVineComicId = getPositiveInteger(
    req.body.comicVineComicId,
    res,
    'comicVineComicId',
  );
  if (comicVineComicId === null) return;

  const { title, notes } = req.body;
  const volumeId = req.body.volumeId === undefined
    ? undefined
    : getPositiveInteger(req.body.volumeId, res, 'volumeId');
  if (req.body.volumeId !== undefined && volumeId === null) return;
  const volumeTitle = getOptionalVolumeTitle(req.body.volumeTitle, res);
  if (volumeTitle === null) return;
  if ((volumeId === undefined) !== (volumeTitle === undefined)) {
    return res.status(400).json({ error: 'volumeId and volumeTitle must be provided together' });
  }
  const status = req.body.status === 'completed' ? 'finished' : (req.body.status ?? 'want_to_read');

  if (!STATUSES.has(status)) {
    return res.status(400).json({
      error: 'status must be want_to_read, reading, finished, or completed',
    });
  }
  if (title !== undefined && !isOptionalString(title)) {
    return res.status(400).json({ error: 'title must be a non-empty string' });
  }
  if (notes !== undefined && typeof notes !== 'string') {
    return res.status(400).json({ error: 'notes must be a string' });
  }

  const item = await addItem(userId, {
    comicVineComicId,
    title: title?.trim(),
    volumeId,
    volumeTitle,
    status,
    notes,
  });

  return res.status(201).json(item);
}

export async function addReadingListItems(req, res) {
  const userId = getPositiveInteger(req.params.userId, res, 'User id');
  if (userId === null) return;

  const items = getReadingListItems(req.body?.items, res);
  if (items === null) return;

  const addedItems = await addItems(userId, items);
  const added = addedItems.filter((item) => item.was_added).length;
  return res.json({
    added,
    skipped: items.length - added,
  });
}

export async function addReadingListVolume(req, res) {
  const userId = getPositiveInteger(req.params.userId, res, 'User id');
  if (userId === null) return;

  const volumeId = getPositiveInteger(req.params.volumeId, res, 'Volume id');
  if (volumeId === null) return;

  const requestedVolumeTitle = getOptionalVolumeTitle(req.body?.volumeTitle, res);
  if (req.body?.volumeTitle !== undefined && requestedVolumeTitle === null) return;
  const issues = await getAllVolumeIssues(volumeId);
  const volumeTitle = requestedVolumeTitle
    ?? issues.find((issue) => issue.volume?.name)?.volume.name
    ?? `Volume ${volumeId}`;
  const items = issues.map((issue) => ({
    comicVineComicId: issue.id,
    title: issue.name?.trim()
      || `${issue.volume?.name || 'Comic'}${issue.issue_number ? ` #${issue.issue_number}` : ''}`,
    volumeId,
    volumeTitle,
  }));
  const addedItems = await addItems(userId, items);
  const added = addedItems.filter((item) => item.was_added).length;

  return res.json({
    added,
    skipped: items.length - added,
  });
}

// PATCH /api/v1/users/:userId/reading-list/:comicVineComicId
export async function changeReadingListStatus(req, res) {
  const userId = getPositiveInteger(req.params.userId, res, 'User id');
  if (userId === null) return;

  const comicVineComicId = getPositiveInteger(
    req.params.comicVineComicId,
    res,
    'Comic Vine comic id',
  );
  if (comicVineComicId === null) return;

  const status = req.body.status === 'completed' ? 'finished' : req.body.status;
  if (!STATUSES.has(status)) {
    return res.status(400).json({
      error: 'status must be want_to_read, reading, finished, or completed',
    });
  }

  const item = await updateStatus(userId, comicVineComicId, status);
  if (!item) return res.status(404).json({ error: 'Reading-list item not found' });

  return res.json(item);
}

// DELETE /api/v1/users/:userId/reading-list/:comicVineComicId
export async function deleteReadingListItem(req, res) {
  const userId = getPositiveInteger(req.params.userId, res, 'User id');
  if (userId === null) return;

  const comicVineComicId = getPositiveInteger(
    req.params.comicVineComicId,
    res,
    'Comic Vine comic id',
  );
  if (comicVineComicId === null) return;

  const deleted = await removeItem(userId, comicVineComicId);
  if (!deleted) return res.status(404).json({ error: 'Reading-list item not found' });

  return res.status(204).send();
}

function getPositiveInteger(value, res, label) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 1) {
    res.status(400).json({ error: `${label} must be a positive integer` });
    return null;
  }
  return number;
}

function isOptionalString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function getReadingListItems(value, res) {
  if (!Array.isArray(value) || value.length === 0 || value.length > 1000) {
    res.status(400).json({ error: 'items must contain between 1 and 1000 issues' });
    return null;
  }

  const itemsById = new Map();
  for (const item of value) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      res.status(400).json({ error: 'each item must be an issue object' });
      return null;
    }

    const comicVineComicId = getPositiveInteger(item.comicVineComicId, res, 'comicVineComicId');
    if (comicVineComicId === null) return null;
    if (item.title !== undefined && !isOptionalString(item.title)) {
      res.status(400).json({ error: 'title must be a non-empty string' });
      return null;
    }

    const volumeId = item.volumeId === undefined
      ? undefined
      : getPositiveInteger(item.volumeId, res, 'volumeId');
    if (item.volumeId !== undefined && volumeId === null) return null;
    const volumeTitle = getOptionalVolumeTitle(item.volumeTitle, res);
    if (volumeTitle === null) return null;
    if ((volumeId === undefined) !== (volumeTitle === undefined)) {
      res.status(400).json({ error: 'volumeId and volumeTitle must be provided together' });
      return null;
    }

    itemsById.set(comicVineComicId, {
      comicVineComicId,
      title: item.title?.trim(),
      volumeId,
      volumeTitle,
    });
  }

  return [...itemsById.values()];
}

function getOptionalVolumeTitle(value, res) {
  if (value === undefined) return undefined;
  if (!isOptionalString(value)) {
    res.status(400).json({ error: 'volumeTitle must be a non-empty string' });
    return null;
  }
  return value.trim();
}