import pool from '../config/database.js';

/**
 * Database row for the users table.
 *
 * @typedef {Object} User
 * @property {string} id PostgreSQL BIGINT values are returned as strings by pg.
 * @property {string} email
 * @property {string} password_hash
 * @property {string} name
 * @property {Date} created_at
 * @property {Date} updated_at
 */

const USER_COLUMNS = 'id, email, name, created_at, updated_at';

export async function findAll() {
  const { rows } = await pool.query(`
    SELECT ${USER_COLUMNS}
    FROM users
    ORDER BY id
  `);

  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query(`
    SELECT ${USER_COLUMNS}
    FROM users
    WHERE id = $1
  `, [id]);

  return rows[0] ?? null;
}

export async function create({ name, email, passwordHash }) {
  const { rows } = await pool.query(`
    INSERT INTO users (name, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING ${USER_COLUMNS}
  `, [name, email, passwordHash]);

  return rows[0];
}

export async function update(id, { name, email }) {
  const { rows } = await pool.query(`
    UPDATE users
    SET name = COALESCE($1, name),
        email = COALESCE($2, email)
    WHERE id = $3
    RETURNING ${USER_COLUMNS}
  `, [name, email, id]);

  return rows[0] ?? null;
}

export async function remove(id) {
  const { rowCount } = await pool.query(
    'DELETE FROM users WHERE id = $1',
    [id],
  );

  return rowCount > 0;
}

// Keep the names used by the existing controller.
export const findAllUsers = findAll;
export const findUserById = findById;