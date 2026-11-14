import express from 'express';

import { requireAuth } from '../controller/authController.js';
import {
  addReadingListItem,
  changeReadingListStatus,
  deleteReadingListItem,
  getReadingList,
} from '../controller/readingListController.js';

const router = express.Router({ mergeParams: true });
router.use(requireAuth);

// GET /api/v1/users/:userId/reading-list
router.get('/', getReadingList);

// POST /api/v1/users/:userId/reading-list
router.post('/', addReadingListItem);

// PATCH /api/v1/users/:userId/reading-list/:comicVineComicId
router.patch('/:comicVineComicId', changeReadingListStatus);

// DELETE /api/v1/users/:userId/reading-list/:comicVineComicId
router.delete('/:comicVineComicId', deleteReadingListItem);

export default router;