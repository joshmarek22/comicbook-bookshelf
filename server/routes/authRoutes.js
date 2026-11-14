import express from 'express';

import {
  getCurrentUser,
  login,
  logout,
  requireAuth,
} from '../controller/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireAuth, getCurrentUser);

export default router;