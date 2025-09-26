import { UserRepository } from '../repositories';
import { CreateUserDto, UpdateUserDto, UserListQueryDto } from '../dtos';
import { NotFoundError, ConflictError } from '../utils/errors';
import { UserRole } from '../types';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(data: CreateUserDto): Promise<any> {
    const { email, password, role } = data;

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const user = await this.userRepository.create({
      email,
      password,
      role: role as UserRole,
    });

    return user.toJSON();
  }

  async getUserById(id: string): Promise<any> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User');
    }
    return user.toJSON();
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<any> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Check if email is being changed and if it's already taken
    if (data.email && data.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser) {
        throw new ConflictError('Email already registered');
      }
    }

    const updatedUser = await this.userRepository.updateById(id, data);
    return updatedUser!.toJSON();
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User');
    }

    await this.userRepository.deleteById(id);
  }

  async getUsers(query: UserListQueryDto): Promise<any> {
    const { search, ...pagination } = query;
    
    if (search) {
      return this.userRepository.searchUsers(search, pagination);
    }
    
    return this.userRepository.findPaginated({}, pagination);
  }

  async getUsersByRole(role: UserRole): Promise<any[]> {
    const users = await this.userRepository.findByRole(role);
    return users.map(user => user.toJSON());
  }

  async activateUser(id: string): Promise<any> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User');
    }

    const updatedUser = await this.userRepository.updateById(id, { isActive: true });
    return updatedUser!.toJSON();
  }

  async deactivateUser(id: string): Promise<any> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User');
    }

    const updatedUser = await this.userRepository.updateById(id, { isActive: false });
    return updatedUser!.toJSON();
  }
}
