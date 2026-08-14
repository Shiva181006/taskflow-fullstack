const ALLOWED_PRIORITIES = ['Low', 'Medium', 'High'];

/**
 * Idempotent seed function. Inserts initial board, columns, and tasks if database is empty.
 * @param {import('better-sqlite3').Database} db
 */
function seedDatabase(db) {
  db.pragma('foreign_keys = ON');

  // Ensure default board exists
  const existingBoard = db.prepare('SELECT id FROM boards LIMIT 1').get();
  let boardId;

  if (!existingBoard) {
    const result = db.prepare('INSERT INTO boards (name) VALUES (?)').run('TaskFlow Board');
    boardId = result.lastInsertRowid;
  } else {
    boardId = existingBoard.id;
  }

  // Ensure columns exist for this board
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

    // Ensure initial tasks exist
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

module.exports = { seedDatabase };
