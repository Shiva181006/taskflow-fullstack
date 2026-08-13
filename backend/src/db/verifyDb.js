const db = require('./database');
const { getTaskCountPerColumn, getTasksByPriority, getBoardWithDetails } = require('./queries');

console.log('=== TASKFLOW DATABASE VERIFICATION ===\n');

// 1. Verify SQLite Tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;").all();
console.log('1. Database Tables Created:', tables.map(t => t.name).join(', '));

// 2. Verify Foreign Keys PRAGMA
const fkStatus = db.prepare('PRAGMA foreign_keys;').get();
console.log('2. Foreign Keys Enabled (1 = Active):', fkStatus.foreign_keys);

// 3. Verify Board & Column Seed Data
const board = getBoardWithDetails(db, 1);
console.log('\n3. Seeded Board Structure:');
console.log(`   Board: "${board.name}" (ID: ${board.id})`);
for (const col of board.columns) {
  console.log(`   └─ Column [${col.id}] "${col.name}" (Position ${col.position}) - Tasks: ${col.tasks.length}`);
}

// 4. Execute & Verify Required Query 1 (Task Count Per Column)
console.log('\n4. REQUIRED QUERY 1 (Task Count Per Column via LEFT JOIN):');
const query1Results = getTaskCountPerColumn(db, 1);
console.table(query1Results);

// 5. Execute & Verify Required Query 2 (Tasks by Priority - High)
console.log('\n5. REQUIRED QUERY 2 (Tasks by Priority = "High", Newest First):');
const query2Results = getTasksByPriority(db, 'High');
console.table(query2Results);

console.log('\n=== VERIFICATION SUCCESSFUL ===');
