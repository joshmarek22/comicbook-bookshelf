import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

import { create, findByEmail, findById } from '../models/userModel.js';

const COOKIE_NAME = 'panelhaus_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export async function login(req, res) {
  const { email, password } = req.body ?? {};

  if (!isNonBlankString(email) || !isNonBlankString(password)) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const user = await findByEmail(email.trim());
  const passwordMatches = user
    ? await bcrypt.compare(password, user.password_hash)
    : false;

  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  res.cookie(COOKIE_NAME, createSessionToken(user.id), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_TTL_SECONDS * 1000,
    path: '/',
  });

  return res.json(toPublicUser(user));
}

export async function register(req, res) {
  const { name, email, password, confirmPassword } = req.body ?? {};

  if (!isNonBlankString(name) || !isNonBlankString(email) || !isNonBlankString(password)) {
    return res.status(400).json({ error: 'name, email, and password are required' });
  }
  if (typeof confirmPassword !== 'string' || password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
    });

    res.cookie(COOKIE_NAME, createSessionToken(user.id), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: SESSION_TTL_SECONDS * 1000,
      path: '/',
    });

    return res.status(201).json(user);
  } catch (error) {
    if (error?.code === '23505') {
      return res.status(409).json({ error: 'An account with that email already exists' });
    }
    throw error;
  }
}

export async function getCurrentUser(req, res) {
  const user = await findById(req.user.id);
  return res.json(user);
}

export function logout(_req, res) {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: 'lax', path: '/' });
  return res.status(204).send();
}

export function requireAuth(req, res, next) {
  const token = parseCookies(req.headers.cookie || '')[COOKIE_NAME];
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const requestedUserId = req.params.userId ?? req.params.id;
  if (requestedUserId && String(requestedUserId) !== String(session.userId)) {
    return res.status(403).json({ error: 'You cannot access another user account' });
  }

  req.user = { id: session.userId };
  return next();
}

function createSessionToken(userId) {
  const payload = Buffer.from(JSON.stringify({
    userId: String(userId),
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function verifySessionToken(token) {
  const [payload, signature] = token.split('.');
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!session.userId || session.expiresAt <= Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
}

function sign(value) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET is not configured');
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length
    && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function parseCookies(header) {
  return Object.fromEntries(header.split(';').map((part) => {
    const [name, ...value] = part.trim().split('=');
    return [name, decodeURIComponent(value.join('='))];
  }).filter(([name]) => name));
}

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

function isNonBlankString(value) {
  return typeof value === 'string' && value.trim() !== '';
}