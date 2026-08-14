const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const { seedDatabase } = require("./seed");

const dbPath =
  process.env.DB_PATH || path.join(__dirname, "../../database.sqlite");
const db = new Database(dbPath);

// Enable foreign key constraints in SQLite
db.pragma("foreign_keys = ON");

// Execute DDL schema to ensure tables exist
const schemaPath = path.join(__dirname, "schema.sql");
const schemaSql = fs.readFileSync(schemaPath, "utf8");
db.exec(schemaSql);

// Perform idempotent initial seeding
seedDatabase(db);

/**
 * Required Query 1: Task Count Per Column (LEFT JOIN & GROUP BY)
 */
function getTaskCountPerColumn(database = db, boardId) {
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
  return database.prepare(sql).all(boardId);
}

/**
 * Required Query 2: Tasks by Priority (Newest First)
 */
function getTasksByPriority(database = db, priority) {
  const sql = `
    SELECT id, column_id, title, description, priority, created_at
    FROM tasks
    WHERE priority = ?
    ORDER BY created_at DESC;
  `;
  return database.prepare(sql).all(priority);
}

/**
 * Fetch complete Board with nested columns and tasks.
 */
function getBoardWithDetails(database = db, boardId) {
  const board = database
    .prepare("SELECT id, name FROM boards WHERE id = ?")
    .get(boardId);
  if (!board) return null;

  const columns = database
    .prepare(
      "SELECT id, name, position FROM columns WHERE board_id = ? ORDER BY position ASC",
    )
    .all(boardId);

  const counts = getTaskCountPerColumn(database, boardId);
  const countMap = new Map(counts.map((c) => [c.column_id, c.task_count]));

  for (const col of columns) {
    col.task_count = countMap.get(col.id) || 0;
    col.tasks = database
      .prepare(
        "SELECT id, column_id, title, description, priority, created_at FROM tasks WHERE column_id = ? ORDER BY created_at DESC",
      )
      .all(col.id);
  }

  board.columns = columns;
  return board;
}

function getColumnById(database = db, columnId) {
  return database
    .prepare("SELECT id, board_id, name, position FROM columns WHERE id = ?")
    .get(columnId);
}

function getTaskById(database = db, taskId) {
  return database
    .prepare(
      "SELECT id, column_id, title, description, priority, created_at FROM tasks WHERE id = ?",
    )
    .get(taskId);
}

function createTask(database = db, { columnId, title, description, priority }) {
  const sql = `
    INSERT INTO tasks (column_id, title, description, priority)
    VALUES (?, ?, ?, ?);
  `;
  const result = database
    .prepare(sql)
    .run(columnId, title, description || null, priority || "Medium");
  return getTaskById(database, result.lastInsertRowid);
}

function updateTask(database = db, taskId, { title, description, priority }) {
  const existingTask = getTaskById(database, taskId);
  if (!existingTask) return null;

  const finalPriority = priority || existingTask.priority;
  const finalDescription =
    description !== undefined ? description : existingTask.description;
  const finalTitle = title !== undefined ? title : existingTask.title;

  const sql = `
    UPDATE tasks
    SET title = ?, description = ?, priority = ?
    WHERE id = ?;
  `;
  database
    .prepare(sql)
    .run(finalTitle, finalDescription, finalPriority, taskId);
  return getTaskById(database, taskId);
}

function deleteTask(database = db, taskId) {
  const result = database.prepare("DELETE FROM tasks WHERE id = ?").run(taskId);
  return result.changes > 0;
}

function moveTask(database = db, taskId, targetColumnId) {
  const sql = `
    UPDATE tasks
    SET column_id = ?
    WHERE id = ?;
  `;
  database.prepare(sql).run(targetColumnId, taskId);
  return getTaskById(database, taskId);
}

module.exports = {
  db,
  getTaskCountPerColumn,
  getTasksByPriority,
  getBoardWithDetails,
  getColumnById,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
};
