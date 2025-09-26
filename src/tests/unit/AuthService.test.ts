import { AuthService } from '../../services';
import { User } from '../../models';
import { ConflictError, UnauthorizedError } from '../../utils/errors';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        role: 'viewer' as const,
      };

      const result = await authService.register(userData);

      expect(result.user.email).toBe(userData.email);
      expect(result.user.role).toBe(userData.role);
      expect(result.tokens).toHaveProperty('accessToken');
      expect(result.tokens).toHaveProperty('refreshToken');
    });

    it('should throw ConflictError if email already exists', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        role: 'viewer' as const,
      };

      // Create first user
      await authService.register(userData);

      // Try to create second user with same email
      await expect(authService.register(userData)).rejects.toThrow(ConflictError);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      // Create a test user
      await User.create({
        email: 'test@example.com',
        password: 'password123',
        role: 'viewer',
        isActive: true,
      });
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await authService.login(loginData);

      expect(result.user.email).toBe(loginData.email);
      expect(result.tokens).toHaveProperty('accessToken');
      expect(result.tokens).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedError with invalid email', async () => {
      const loginData = {
        email: 'wrong@example.com',
        password: 'password123',
      };

      await expect(authService.login(loginData)).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError with invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await expect(authService.login(loginData)).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError for inactive user', async () => {
      // Create inactive user
      await User.create({
        email: 'inactive@example.com',
        password: 'password123',
        role: 'viewer',
        isActive: false,
      });

      const loginData = {
        email: 'inactive@example.com',
        password: 'password123',
      };

      await expect(authService.login(loginData)).rejects.toThrow(UnauthorizedError);
    });
  });
});
