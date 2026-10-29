import express from 'express';

import {
  addReadingListItem,
  changeReadingListStatus,
  deleteReadingListItem,
  getReadingList,
} from '../controller/readingListController.js';

const router = express.Router({ mergeParams: true });

// GET /api/v1/users/:userId/reading-list
router.get('/', getReadingList);

// POST /api/v1/users/:userId/reading-list
router.post('/', addReadingListItem);

// PATCH /api/v1/users/:userId/reading-list/:marvelComicId
router.patch('/:marvelComicId', changeReadingListStatus);

// DELETE /api/v1/users/:userId/reading-list/:marvelComicId
router.delete('/:marvelComicId', deleteReadingListItem);

export default router;