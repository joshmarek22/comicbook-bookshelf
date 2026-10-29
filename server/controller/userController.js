import {
  create,
  findAll,
  findById,
  remove,
  update,
} from '../models/userModel.js';

export async function getUsers(_req, res) {
  const users = await findAll();
  res.json(users);
}

export async function getUserById(req, res) {
  const id = getUserId(req, res);
  if (id === null) return;

  const user = await findById(id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json(user);
}

export async function createUser(req, res) {
  const { name, email, passwordHash } = req.body;

  if (!isNonBlankString(name) || !isNonBlankString(email) || !isNonBlankString(passwordHash)) {
    return res.status(400).json({
      error: 'name, email, and passwordHash are required',
    });
  }

  const user = await create({ name, email, passwordHash });
  return res.status(201).json(user);
}

export async function updateUser(req, res) {
  const id = getUserId(req, res);
  if (id === null) return;

  const { name, email } = req.body;
  if (name !== undefined && !isNonBlankString(name)) {
    return res.status(400).json({ error: 'name must be a non-empty string' });
  }
  if (email !== undefined && !isNonBlankString(email)) {
    return res.status(400).json({ error: 'email must be a non-empty string' });
  }
  if (name === undefined && email === undefined) {
    return res.status(400).json({ error: 'name or email is required' });
  }

  const user = await update(id, { name, email });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json(user);
}

export async function deleteUser(req, res) {
  const id = getUserId(req, res);
  if (id === null) return;

  const deleted = await remove(id);
  if (!deleted) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.status(204).send();
}

function getUserId(req, res) {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id < 1) {
    res.status(400).json({ error: 'User id must be a positive integer' });
    return null;
  }

  return id;
}

function isNonBlankString(value) {
  return typeof value === 'string' && value.trim() !== '';
}