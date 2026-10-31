import express from 'express';

import {
  getComic,
  listComics,
} from '../controller/comicBookController.js';

const router = express.Router();

// GET /api/v1/comics?search=spider&limit=20&offset=0
router.get('/', listComics);

// GET /api/v1/comics/:id
router.get('/:id', getComic);

export default router;