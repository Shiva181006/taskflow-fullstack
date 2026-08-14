const request = require('supertest');
const path = require('path');
const fs = require('fs');

const TEST_DB_PATH = path.join(__dirname, '../test.sqlite');
process.env.DB_PATH = TEST_DB_PATH;

// Ensure clean test database initialization
if (fs.existsSync(TEST_DB_PATH)) {
  try {
    fs.unlinkSync(TEST_DB_PATH);
  } catch (e) {
    // Ignore if file is locked
  }
}

const app = require('../src/app');
const { db } = require('../src/db');

describe('Backend API Integration Tests', () => {

  afterAll(() => {
    if (db && db.open) {
      db.close();
    }
    if (fs.existsSync(TEST_DB_PATH)) {
      try {
        fs.unlinkSync(TEST_DB_PATH);
      } catch (e) {
        // Ignore cleanup error
      }
    }
  });

  // TEST 1 — EMPTY/WHITESPACE TITLE VALIDATION & DB PERSISTENCE
  test('Test 1: POST /api/tasks with whitespace title returns 400 and does not insert task into SQLite', async () => {
    // 1. Get initial task count directly from test.sqlite
    const initialCount = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;

    // 2. Send invalid request with whitespace title
    const response = await request(app)
      .post('/api/tasks')
      .send({
        title: '   ',
        columnId: 1,
      });

    // 3. Assert HTTP status code 400 and JSON error payload
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('title');

    // 4. Query test.sqlite directly to verify task count has not increased
    const finalCount = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;
    expect(finalCount).toBe(initialCount);
  });

  // TEST 2 — TASK MOVEMENT PERSISTENCE
  test('Test 2: PATCH /api/tasks/:id/move updates column_id and persists in SQLite', async () => {
    const taskId = 1; // Existing seeded task
    const targetColumnId = 2; // Move to column 2 ('In Progress')

    // 1. Send task movement HTTP request
    const response = await request(app)
      .patch(`/api/tasks/${taskId}/move`)
      .send({ columnId: targetColumnId });

    expect(response.status).toBe(200);
    expect(response.body.column_id).toBe(targetColumnId);

    // 2. Query test.sqlite database directly to verify persistence
    const taskInDb = db.prepare('SELECT column_id FROM tasks WHERE id = ?').get(taskId);
    expect(taskInDb).toBeDefined();
    expect(taskInDb.column_id).toBe(targetColumnId);
  });

});
