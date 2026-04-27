import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  console.log('🚀 Starting Database Migration...');

  const config = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'postgres', // Connect to default first
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
  };

  const client = new Client(config);

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL server.');

    const dbName = process.env.DB_NAME || 'calendar';
    
    // Check if database exists
    const dbRes = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);
    if (dbRes.rowCount === 0) {
      console.log(`- Creating database: ${dbName}...`);
      await client.query(`CREATE DATABASE ${dbName}`);
    }
    await client.end();

    // Connect to target database
    const dbClient = new Client({ ...config, database: dbName });
    await dbClient.connect();
    console.log(`✅ Connected to database: ${dbName}`);

    const sqlPath = path.join(process.cwd(), 'src', 'init_db_pg.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('- Running SQL initialization script...');
    await dbClient.query(sql);

    console.log('🎉 Migration completed successfully!');
    await dbClient.end();
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
