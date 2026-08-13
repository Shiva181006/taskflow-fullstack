const defaultDb = require('./database');

/**
 * Required SQL Query 1: Task Count Per Column
 * Returns the task count for each column in a given board, including empty columns (task_count = 0).
 * Uses LEFT JOIN and GROUP BY, ordered by column position.
 * @param {import('better-sqlite3').Database} [db]
 * @param {number} boardId
 */
function getTaskCountPerColumn(db = defaultDb, boardId) {
  const sql = `
    SELECT
        c.id AS column_id,
        c.name AS column_name,
        c.position,
        COUNT(t.id) AS task_count
    FROM columns c
    LEFT JOIN tasks t
        ON t.column_id = c.id
    WHERE c.board_id = ?
    GROUP BY c.id, c.name, c.position
    ORDER BY c.position ASC;
  `;
  return db.prepare(sql).all(boardId);
}

/**
 * Required SQL Query 2: Tasks By Priority (Newest First)
 * Retrieves tasks matching a specific priority ordered by creation timestamp descending.
 * Uses a parameterized query.
 * @param {import('better-sqlite3').Database} [db]
 * @param {string} priority - 'Low' | 'Medium' | 'High'
 */
function getTasksByPriority(db = defaultDb, priority) {
  const sql = `
    SELECT
        id,
        column_id,
        title,
        description,
        priority,
        created_at
    FROM tasks
    WHERE priority = ?
    ORDER BY created_at DESC;
  `;
  return db.prepare(sql).all(priority);
}

/**
 * Helper: Fetch full board structure (Board -> Columns -> Tasks)
 * @param {import('better-sqlite3').Database} [db]
 * @param {number} boardId
 */
function getBoardWithDetails(db = defaultDb, boardId) {
  const board = db.prepare('SELECT id, name FROM boards WHERE id = ?').get(boardId);
  if (!board) return null;

  const columns = db
    .prepare('SELECT id, name, position FROM columns WHERE board_id = ? ORDER BY position ASC')
    .all(boardId);

  const counts = getTaskCountPerColumn(db, boardId);
  const countMap = new Map(counts.map((c) => [c.column_id, c.task_count]));

  for (const col of columns) {
    col.task_count = countMap.get(col.id) || 0;
    col.tasks = db
      .prepare(
        'SELECT id, column_id, title, description, priority, created_at FROM tasks WHERE column_id = ? ORDER BY created_at DESC'
      )
      .all(col.id);
  }

  board.columns = columns;
  return board;
}

module.exports = {
  getTaskCountPerColumn,
  getTasksByPriority,
  getBoardWithDetails,
};
