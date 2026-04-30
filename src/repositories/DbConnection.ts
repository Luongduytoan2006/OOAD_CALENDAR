import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

interface DbConnection {
  run: (sql: string, params?: any[]) => Promise<any>;
  get: (sql: string, params?: any[]) => Promise<any>;
  all: (sql: string, params?: any[]) => Promise<any[]>;
  close: () => Promise<void>;
}

export class DbConnection {
  private static db: sqlite3.Database | null = null;
  private static connection: DbConnection | null = null;

  public static async getConnection(): Promise<DbConnection> {
    if (this.connection) return this.connection;

    try {
      const dbPath = path.join(process.cwd(), 'calendar.db');
      
      this.db = new sqlite3.Database(dbPath);
      
      // Create wrapper with promisified methods
      this.connection = {
        run: (sql: string, params: any[] = []) => new Promise((resolve, reject) => {
          this.db!.run(sql, params, function(this: any, err: Error | null) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
          });
        }),
        
        get: promisify((sql: string, params: any[], callback: (err: Error | null, row: any) => void) => {
          this.db!.get(sql, params, callback);
        }) as (sql: string, params?: any[]) => Promise<any>,
        
        all: promisify((sql: string, params: any[], callback: (err: Error | null, rows: any[]) => void) => {
          this.db!.all(sql, params, callback);
        }) as (sql: string, params?: any[]) => Promise<any[]>,
        
        close: promisify((callback: (err: Error | null) => void) => {
          this.db!.close(callback);
        }) as () => Promise<void>,
      };
      
      // Test connection
      await this.connection.get('SELECT 1');
      console.log(`✅ Connected to SQLite database at ${dbPath}`);
      return this.connection;
    } catch (err: any) {
      console.error('Database connection failed:', err.message);
      throw err;
    }
  }

  public static async close(): Promise<void> {
    if (this.db) {
      await new Promise<void>((resolve, reject) => {
        this.db!.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      this.db = null;
      this.connection = null;
    }
  }
}
