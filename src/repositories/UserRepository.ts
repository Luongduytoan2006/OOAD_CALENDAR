import { User } from '../models/User';
import { DbConnection } from './DbConnection';

export class UserRepository {
  async getAll(): Promise<User[]> {
    const db = await DbConnection.getConnection();
    const rows = await db.all('SELECT * FROM users');
    return rows.map(row => new User(row.user_id, row.full_name));
  }

  async getById(userId: number): Promise<User | null> {
    const db = await DbConnection.getConnection();
    const row = await db.get('SELECT * FROM users WHERE user_id = ?', [userId]);
    
    if (!row) return null;
    return new User(row.user_id, row.full_name);
  }
}
