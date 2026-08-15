const path = require('path');
const fs = require('fs');

const TEST_DB_PATH = path.join(__dirname, '../test.sqlite');
process.env.DB_PATH = TEST_DB_PATH;

const { db, getTaskCountPerColumn, getTasksByPriority } = require('../src/db');

describe('Database Layer Tests', () => {

  afterAll(() => {
    if (db && db.open) {
      db.close();
    }
  });

  // TEST 3 — TASK COUNT SQL QUERY LAYER TEST
  test('Test 3: getTaskCountPerColumn executes raw LEFT JOIN / GROUP BY query against test.sqlite data', () => {
    const boardId = 1;

    // Execute SQL query function directly against test database without mocking
    const results = getTaskCountPerColumn(db, boardId);

    // Verify array returned with 3 columns
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(3);

    // Find column entries
    const todoCol = results.find((c) => c.column_name === 'To Do');
    const inProgressCol = results.find((c) => c.column_name === 'In Progress');
    const doneCol = results.find((c) => c.column_name === 'Done');

    expect(todoCol).toBeDefined();
    expect(inProgressCol).toBeDefined();
    expect(doneCol).toBeDefined();

    // Verify column position ordering
    expect(results[0].column_id).toBe(1);
    expect(results[1].column_id).toBe(2);
    expect(results[2].column_id).toBe(3);

    // Verify accurate task counts against seeded data
    expect(todoCol.task_count).toBe(2);
    expect(inProgressCol.task_count).toBe(2);
    expect(doneCol.task_count).toBe(1);
  });

  // TEST 4 — TASKS BY PRIORITY SQL QUERY LAYER TEST
  test('Test 4: getTasksByPriority executes raw SQL query with WHERE and ORDER BY (newest first)', () => {
    const highPriorityTasks = getTasksByPriority(db, 'High');

    expect(Array.isArray(highPriorityTasks)).toBe(true);
    expect(highPriorityTasks.length).toBeGreaterThan(0);
    highPriorityTasks.forEach((task) => {
      expect(task.priority).toBe('High');
    });

    // Verify ordering: newest first (created_at DESC)
    for (let i = 0; i < highPriorityTasks.length - 1; i++) {
      const current = new Date(highPriorityTasks[i].created_at).getTime();
      const next = new Date(highPriorityTasks[i + 1].created_at).getTime();
      expect(current).toBeGreaterThanOrEqual(next);
    }

    const lowPriorityTasks = getTasksByPriority(db, 'Low');
    expect(Array.isArray(lowPriorityTasks)).toBe(true);
    lowPriorityTasks.forEach((task) => {
      expect(task.priority).toBe('Low');
    });
  });

});
