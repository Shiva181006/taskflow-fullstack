const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { seedDatabase } = require('./seed');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../../database.sqlite');
const isNewDb = !fs.existsSync(dbPath);

const db = new Database(dbPath);

// Always enable foreign key constraints in SQLite
db.pragma('foreign_keys = ON');

// Execute DDL schema to ensure tables exist
const schemaPath = path.join(__dirname, 'schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');
db.exec(schemaSql);

// If database file was newly created or tables empty, perform idempotent initial seeding
seedDatabase(db);

if (isNewDb) {
  console.log('[Database] Database created and seeded successfully.');
} else {
  console.log('[Database] Connected to existing SQLite database.');
}

module.exports = db;
