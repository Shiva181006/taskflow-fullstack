const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

/**
 * Idempotent seed function. Inserts initial board, columns, and tasks if database is empty.
 * @param {import('better-sqlite3').Database} db
 */
function seedDatabase(db) {
  // Ensure foreign keys are ON
  db.pragma('foreign_keys = ON');

  // Check if any board exists
  const existingBoard = db.prepare('SELECT id FROM boards LIMIT 1').get();
  let boardId;

  if (!existingBoard) {
    const insertBoard = db.prepare('INSERT INTO boards (name) VALUES (?)');
    const result = insertBoard.run('TaskFlow Board');
    boardId = result.lastInsertRowid;
  } else {
    boardId = existingBoard.id;
  }

  // Check if columns exist for this board
  const existingColumnsCount = db
    .prepare('SELECT COUNT(*) as count FROM columns WHERE board_id = ?')
    .get(boardId).count;

  if (existingColumnsCount === 0) {
    const insertColumn = db.prepare(
      'INSERT INTO columns (board_id, name, position) VALUES (?, ?, ?)'
    );

    const todoCol = insertColumn.run(boardId, 'To Do', 1);
    const inProgressCol = insertColumn.run(boardId, 'In Progress', 2);
    const doneCol = insertColumn.run(boardId, 'Done', 3);

    // Check if tasks exist
    const existingTasksCount = db
      .prepare('SELECT COUNT(*) as count FROM tasks')
      .get().count;

    if (existingTasksCount === 0) {
      const insertTask = db.prepare(
        'INSERT INTO tasks (column_id, title, description, priority) VALUES (?, ?, ?, ?)'
      );

      const tasksToInsert = [
        {
          columnId: todoCol.lastInsertRowid,
          title: 'Design Database Schema',
          description: 'Define boards, columns, and tasks tables with foreign keys.',
          priority: 'High',
        },
        {
          columnId: todoCol.lastInsertRowid,
          title: 'Setup Express Project',
          description: 'Configure backend server, routes, and middleware.',
          priority: 'Medium',
        },
        {
          columnId: inProgressCol.lastInsertRowid,
          title: 'Implement REST APIs',
          description: 'Build board retrieval, task CRUD, and task movement routes.',
          priority: 'High',
        },
        {
          columnId: inProgressCol.lastInsertRowid,
          title: 'Write Backend Tests',
          description: 'Cover empty title validation, task movement, and SQL query layer.',
          priority: 'Medium',
        },
        {
          columnId: doneCol.lastInsertRowid,
          title: 'Project Initialization',
          description: 'Create repository, root structure, and Vite React frontend.',
          priority: 'Low',
        },
      ];

      const seedTransaction = db.transaction((tasks) => {
        for (const t of tasks) {
          insertTask.run(t.columnId, t.title, t.description, t.priority);
        }
      });

      seedTransaction(tasksToInsert);
    }
  }
}

// Allow direct execution via command line: node src/db/seed.js
if (require.main === module) {
  const dbPath = process.env.DB_PATH || path.join(__dirname, '../../../database.sqlite');
  const db = new Database(dbPath);
  
  // Apply schema first if running standalone
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSql);
  
  seedDatabase(db);
  db.close();
  console.log('[Seed] Standalone seed script finished successfully.');
}

module.exports = { seedDatabase };
