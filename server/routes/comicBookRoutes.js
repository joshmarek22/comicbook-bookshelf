import express from 'express';

import {
  getComic,
  getVolume,
  listVolumeIssues,
  listVolumes,
  listComics,
} from '../controller/comicBookController.js';

const router = express.Router();

// GET /api/v1/comics/volumes?search=secret+wars&limit=24&offset=0
router.get('/volumes', listVolumes);

// GET /api/v1/comics/volumes/:id/issues?limit=24&offset=0
router.get('/volumes/:id/issues', listVolumeIssues);

// GET /api/v1/comics/volumes/:id
router.get('/volumes/:id', getVolume);

// GET /api/v1/comics?search=spider&limit=20&offset=0
router.get('/', listComics);

// GET /api/v1/comics/:id
router.get('/:id', getComic);

export default router;