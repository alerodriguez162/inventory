import { BaseRepository } from './BaseRepository';
import { User, IUser } from '../models';
import { UserRole } from '../types';

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.model.findOne({ email: email.toLowerCase() });
  }

  async findActiveUsers(): Promise<IUser[]> {
    return this.model.find({ isActive: true });
  }

  async findByRole(role: UserRole): Promise<IUser[]> {
    return this.model.find({ role, isActive: true });
  }

  async updateLastLogin(userId: string): Promise<IUser | null> {
    return this.model.findByIdAndUpdate(
      userId,
      { lastLogin: new Date() },
      { new: true }
    );
  }

  async incrementTokenVersion(userId: string): Promise<IUser | null> {
    return this.model.findByIdAndUpdate(
      userId,
      { $inc: { tokenVersion: 1 } },
      { new: true }
    );
  }

  async searchUsers(query: string, pagination: any): Promise<any> {
    const searchFields = ['email'];
    return this.findWithSearch({}, searchFields, query, pagination);
  }
}
