import pool from '../config/database.js';

const ITEM_COLUMNS = `
  id, user_id, marvel_comic_id, title_snapshot, status, notes,
  started_at, finished_at, created_at, updated_at
`;

export async function findByUserId(userId, status) {
  const values = [userId];
  const statusFilter = status ? 'AND status = $2' : '';

  if (status) values.push(status);

  const { rows } = await pool.query(`
    SELECT ${ITEM_COLUMNS}
    FROM user_comic_items
    WHERE user_id = $1 ${statusFilter}
    ORDER BY created_at DESC, id DESC
  `, values);

  return rows;
}

export async function addItem(userId, {
  marvelComicId,
  title,
  status = 'want_to_read',
  notes,
}) {
  const { rows } = await pool.query(`
    INSERT INTO user_comic_items
      (user_id, marvel_comic_id, title_snapshot, status, notes,
       started_at, finished_at)
    VALUES (
      $1, $2, $3, $4, $5,
      CASE WHEN $4 = 'reading' OR $4 = 'finished' THEN NOW() END,
      CASE WHEN $4 = 'finished' THEN NOW() END
    )
    RETURNING ${ITEM_COLUMNS}
  `, [userId, marvelComicId, title ?? null, status, notes ?? null]);

  return rows[0];
}

export async function updateStatus(userId, itemIdOrMarvelComicId, status) {
  const { rows } = await pool.query(`
    UPDATE user_comic_items
    SET status = $3,
        started_at = CASE
          WHEN $3 IN ('reading', 'finished') THEN COALESCE(started_at, NOW())
          ELSE NULL
        END,
        finished_at = CASE
          WHEN $3 = 'finished' THEN COALESCE(finished_at, NOW())
          ELSE NULL
        END
    WHERE id = (
      SELECT id
      FROM user_comic_items
      WHERE user_id = $1
        AND (id = $2 OR marvel_comic_id = $2)
      ORDER BY (id = $2) DESC
      LIMIT 1
    )
    RETURNING ${ITEM_COLUMNS}
  `, [userId, itemIdOrMarvelComicId, status]);

  return rows[0] ?? null;
}

export async function removeItem(userId, marvelComicId) {
  const { rowCount } = await pool.query(`
    DELETE FROM user_comic_items
    WHERE user_id = $1 AND marvel_comic_id = $2
  `, [userId, marvelComicId]);

  return rowCount > 0;
}