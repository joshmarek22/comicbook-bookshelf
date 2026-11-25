import express from 'express';

import {
  getCurrentUser,
  login,
  logout,
  register,
  requireAuth,
} from '../controller/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.get('/me', requireAuth, getCurrentUser);

export default router;