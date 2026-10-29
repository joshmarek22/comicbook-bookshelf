import {
  addItem,
  findByUserId,
  removeItem,
  updateStatus,
} from '../models/readingListModel.js';

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

  const marvelComicId = getPositiveInteger(req.body.marvelComicId, res, 'marvelComicId');
  if (marvelComicId === null) return;

  const { title, notes } = req.body;
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
    marvelComicId,
    title: title?.trim(),
    status,
    notes,
  });

  return res.status(201).json(item);
}

// PATCH /api/v1/users/:userId/reading-list/:marvelComicId
export async function changeReadingListStatus(req, res) {
  const userId = getPositiveInteger(req.params.userId, res, 'User id');
  if (userId === null) return;

  const marvelComicId = getPositiveInteger(req.params.marvelComicId, res, 'Marvel comic id');
  if (marvelComicId === null) return;

  const status = req.body.status === 'completed' ? 'finished' : req.body.status;
  if (!STATUSES.has(status)) {
    return res.status(400).json({
      error: 'status must be want_to_read, reading, finished, or completed',
    });
  }

  const item = await updateStatus(userId, marvelComicId, status);
  if (!item) return res.status(404).json({ error: 'Reading-list item not found' });

  return res.json(item);
}

// DELETE /api/v1/users/:userId/reading-list/:marvelComicId
export async function deleteReadingListItem(req, res) {
  const userId = getPositiveInteger(req.params.userId, res, 'User id');
  if (userId === null) return;

  const marvelComicId = getPositiveInteger(req.params.marvelComicId, res, 'Marvel comic id');
  if (marvelComicId === null) return;

  const deleted = await removeItem(userId, marvelComicId);
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