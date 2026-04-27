import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export class DbConnection {
  private static pool: Pool | null = null;

  public static async getConnection(): Promise<Pool> {
    if (this.pool) return this.pool;

    try {
      this.pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT || '5432'),
      });
      
      // Test connection
      await this.pool.query('SELECT NOW()');
      console.log('Connected to PostgreSQL successfully');
      return this.pool;
    } catch (err: any) {
      console.error('Database connection failed:', err.message);
      throw err;
    }
  }

  public static async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}
