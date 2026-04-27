import { User } from '../models/User';
import { UserRepository } from '../repositories/UserRepository';

export class UserService {
  constructor(private userRepo: UserRepository) {}

  async getAllUsers(): Promise<User[]> {
    return this.userRepo.getAll();
  }

  async getUserById(userId: number): Promise<User | null> {
    return this.userRepo.getById(userId);
  }
}
