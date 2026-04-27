import { User } from '../models/User';
import { DbConnection } from './DbConnection';

export class UserRepository {
  async getAll(): Promise<User[]> {
    const pool = await DbConnection.getConnection();
    const result = await pool.query('SELECT * FROM users');
    return result.rows.map(row => new User(row.user_id, row.full_name));
  }

  async getById(userId: number): Promise<User | null> {
    const pool = await DbConnection.getConnection();
    const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
    
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return new User(row.user_id, row.full_name);
  }
}
