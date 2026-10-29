import express from 'express';

import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from '../controller/userController.js';

const router = express.Router();

// GET /api/v1/users
router.get('/', getUsers);

// POST /api/v1/users
router.post('/', createUser);

// GET /api/v1/users/:id
router.get('/:id', getUserById);

// PATCH /api/v1/users/:id
router.patch('/:id', updateUser);

// DELETE /api/v1/users/:id
router.delete('/:id', deleteUser);

export default router;