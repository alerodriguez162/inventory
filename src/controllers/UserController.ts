import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services';
import { createUserSchema, updateUserSchema, userListQuerySchema, idSchema } from '../dtos';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = createUserSchema.parse(req.body);
      const user = await this.userService.createUser(data);
      
      res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = userListQuerySchema.parse(req.query);
      const result = await this.userService.getUsers(query);
      
      res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = idSchema.parse(req.params);
      const user = await this.userService.getUserById(id);
      
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = idSchema.parse(req.params);
      const data = updateUserSchema.parse(req.body);
      const user = await this.userService.updateUser(id, data);
      
      res.status(200).json({
        success: true,
        data: user,
        message: 'User updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = idSchema.parse(req.params);
      await this.userService.deleteUser(id);
      
      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  activateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = idSchema.parse(req.params);
      const user = await this.userService.activateUser(id);
      
      res.status(200).json({
        success: true,
        data: user,
        message: 'User activated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  deactivateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = idSchema.parse(req.params);
      const user = await this.userService.deactivateUser(id);
      
      res.status(200).json({
        success: true,
        data: user,
        message: 'User deactivated successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
