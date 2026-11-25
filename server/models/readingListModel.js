import pool from '../config/database.js';

const ITEM_COLUMNS = `
  id, user_id, comic_vine_comic_id, title_snapshot,
  comic_vine_volume_id, volume_title_snapshot, status, notes,
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

export async function findSaveCounts(comicVineComicIds) {
  if (comicVineComicIds.length === 0) return [];

  const { rows } = await pool.query(`
    SELECT comic_vine_comic_id, COUNT(*)::int AS save_count
    FROM user_comic_items
    WHERE comic_vine_comic_id = ANY($1::bigint[])
    GROUP BY comic_vine_comic_id
  `, [comicVineComicIds]);

  return rows;
}

export async function addItem(userId, {
  comicVineComicId,
  title,
  volumeId,
  volumeTitle,
  status = 'want_to_read',
  notes,
}) {
  const { rows } = await pool.query(`
    INSERT INTO user_comic_items
      (user_id, comic_vine_comic_id, title_snapshot,
       comic_vine_volume_id, volume_title_snapshot, status, notes,
       started_at, finished_at)
    VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      CASE WHEN $6 = 'reading' OR $6 = 'finished' THEN NOW() END,
      CASE WHEN $6 = 'finished' THEN NOW() END
    )
    RETURNING ${ITEM_COLUMNS}
  `, [
    userId,
    comicVineComicId,
    title ?? null,
    volumeId ?? null,
    volumeTitle ?? null,
    status,
    notes ?? null,
  ]);

  return rows[0];
}

export async function addItems(userId, items) {
  if (items.length === 0) return [];

  const comicVineComicIds = items.map(({ comicVineComicId }) => comicVineComicId);
  const titles = items.map(({ title }) => title ?? null);
  const volumeIds = items.map(({ volumeId }) => volumeId ?? null);
  const volumeTitles = items.map(({ volumeTitle }) => volumeTitle ?? null);
  const { rows } = await pool.query(`
    INSERT INTO user_comic_items (
      user_id, comic_vine_comic_id, title_snapshot,
      comic_vine_volume_id, volume_title_snapshot
    )
    SELECT $1, comic.comic_vine_comic_id, comic.title_snapshot,
           comic.comic_vine_volume_id, comic.volume_title_snapshot
    FROM unnest($2::bigint[], $3::text[], $4::bigint[], $5::text[])
      AS comic(comic_vine_comic_id, title_snapshot,
               comic_vine_volume_id, volume_title_snapshot)
    ON CONFLICT (user_id, comic_vine_comic_id) DO UPDATE
      SET comic_vine_volume_id = COALESCE(
            user_comic_items.comic_vine_volume_id,
            EXCLUDED.comic_vine_volume_id
          ),
          volume_title_snapshot = COALESCE(
            user_comic_items.volume_title_snapshot,
            EXCLUDED.volume_title_snapshot
          )
      WHERE user_comic_items.comic_vine_volume_id IS NULL
        AND EXCLUDED.comic_vine_volume_id IS NOT NULL
    RETURNING ${ITEM_COLUMNS}, (xmax = 0) AS was_added
  `, [userId, comicVineComicIds, titles, volumeIds, volumeTitles]);

  return rows;
}

export async function updateStatus(userId, itemIdOrComicVineComicId, status) {
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
        AND (id = $2 OR comic_vine_comic_id = $2)
      ORDER BY (id = $2) DESC
      LIMIT 1
    )
    RETURNING ${ITEM_COLUMNS}
  `, [userId, itemIdOrComicVineComicId, status]);

  return rows[0] ?? null;
}

export async function removeItem(userId, comicVineComicId) {
  const { rowCount } = await pool.query(`
    DELETE FROM user_comic_items
    WHERE user_id = $1 AND comic_vine_comic_id = $2
  `, [userId, comicVineComicId]);

  return rowCount > 0;
}