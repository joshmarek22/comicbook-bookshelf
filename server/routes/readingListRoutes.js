import express from 'express';

import { requireAuth } from '../controller/authController.js';
import {
  addReadingListItem,
  addReadingListItems,
  addReadingListVolume,
  changeReadingListStatus,
  deleteReadingListItem,
  getReadingList,
} from '../controller/readingListController.js';

const router = express.Router({ mergeParams: true });
router.use(requireAuth);

// GET /api/v1/users/:userId/reading-list
router.get('/', getReadingList);

// POST /api/v1/users/:userId/reading-list/bulk
router.post('/bulk', addReadingListItems);

// POST /api/v1/users/:userId/reading-list/volumes/:volumeId
router.post('/volumes/:volumeId', addReadingListVolume);

// POST /api/v1/users/:userId/reading-list
router.post('/', addReadingListItem);

// PATCH /api/v1/users/:userId/reading-list/:comicVineComicId
router.patch('/:comicVineComicId', changeReadingListStatus);

// DELETE /api/v1/users/:userId/reading-list/:comicVineComicId
router.delete('/:comicVineComicId', deleteReadingListItem);

export default router;