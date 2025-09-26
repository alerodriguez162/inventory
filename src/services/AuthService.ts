import { UserRepository } from '../repositories';
import { User } from '../models';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt';
import { UnauthorizedError, ConflictError, NotFoundError } from '../utils/errors';
import { LoginDto, RegisterDto, RefreshTokenDto } from '../dtos';
import { UserRole } from '../types';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(data: RegisterDto): Promise<{ user: any; tokens: any }> {
    const { email, password, role = 'viewer' } = data;

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Create user
    const user = await this.userRepository.create({
      email,
      password,
      role: role as UserRole,
    });

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return {
      user: user.toJSON(),
      tokens,
    };
  }

  async login(data: LoginDto): Promise<{ user: any; tokens: any }> {
    const { email, password } = data;

    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Update last login
    await this.userRepository.updateLastLogin(user._id.toString());

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return {
      user: user.toJSON(),
      tokens,
    };
  }

  async refreshToken(data: RefreshTokenDto): Promise<{ tokens: any }> {
    const { refreshToken } = data;

    try {
      const payload = verifyRefreshToken(refreshToken);
      
      // Find user and verify token version
      const user = await this.userRepository.findById(payload.userId);
      if (!user || !user.isActive) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = generateTokenPair({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      return { tokens };
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    // Invalidate refresh token by incrementing token version
    await this.userRepository.incrementTokenVersion(userId);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Update password and increment token version
    await this.userRepository.updateById(userId, {
      password: newPassword,
      $inc: { tokenVersion: 1 },
    });
  }
}
