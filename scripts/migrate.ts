import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  console.log('🚀 Starting Database Migration (SQLite)...');

  const dbPath = path.join(process.cwd(), 'calendar.db');

  return new Promise<void>((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Failed to open database:', err.message);
        reject(err);
        return;
      }

      console.log(`✅ Connected to SQLite database at ${dbPath}`);

      const sqlPath = path.join(process.cwd(), 'src', 'init_db_sqlite.sql');
      const sql = fs.readFileSync(sqlPath, 'utf8');

      console.log('- Running SQL initialization script...');
      
      db.exec(sql, (err) => {
        if (err) {
          console.error('❌ Migration failed:', err.message);
          db.close();
          reject(err);
          return;
        }

        console.log('🎉 Migration completed successfully!');
        db.close(() => {
          resolve();
        });
      });
    });
  });
}

migrate().catch(() => process.exit(1));
