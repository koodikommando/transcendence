import { Database } from 'sqlite';

import { GameAudioOptions, GameSettings, GraphicsSettings } from '@shared/types';

import { BadRequestError, NotFoundError } from '@my-backend/main_server';

import { UserModel } from '../models/UserModel';

export class UserService {
  private userModel: UserModel;
  private static instance: UserService;

  constructor(db: Database) {
    this.userModel = UserModel.getInstance(db);
  }

  static getInstance(db: Database) {
    if (!UserService.instance) {
      UserService.instance = new UserService(db);
    }
    return UserService.instance;
  }

  async createUser(user_id: string) {
    const res = await this.userModel.createUser(user_id);
    if (!res) {
      throw new BadRequestError('Could not create user');
    }
    return res;
  }

  async getUserByID(user_id: string) {
    const res = await this.userModel.getUserByID(user_id);
    if (!res) {
      throw new NotFoundError('User not found');
    }
    return res;
  }

  async getAllUsers(user_id: string) {
    const res = await this.userModel.getAllUsers(user_id);
    if (res.length === 0) {
      throw new NotFoundError('No users found');
    }
    return res;
  }

  async getAllUsersWithRank() {
    const res = await this.userModel.getAllUsersWithRank();
    if (res.length === 0) {
      throw new NotFoundError('No users found');
    }
    return res;
  }

  async updateUserByID(
    user_id: string,
    updates: Partial<{
      display_name: string;
      first_name: string;
      last_name: string;
      bio: string;
      avatar_url: string;
      status: string;
      email: string;
    }>
  ) {
    const res = await this.userModel.updateUserByID(user_id, updates);
    if (!res) {
      throw new BadRequestError('Could not update user');
    }
    return res;
  }

  async deleteUserByID(user_id: string) {
    const res = await this.userModel.deleteUserByID(user_id);
    if (res.changes === 0) {
      throw new BadRequestError('No changes made in deleting user');
    }
    return res;
  }

  async createUserStats(user_id: string) {
    const res = await this.userModel.createUserStats(user_id);
    if (!res) {
      throw new BadRequestError('Could not create user stats');
    }
    return res;
  }

  async getUserData(user_id: string) {
    const res = await this.userModel.getUserData(user_id);
    if (!res) {
      throw new NotFoundError('User data not found');
    }
    return res;
  }

  async getNotifications(user_id: string) {
    const res = await this.userModel.getNotifications(user_id);
    return res;
  }

  async markNotificationAsSeen(notification_id: string) {
    const res = await this.userModel.markNotificationAsSeen(notification_id);
    if (!res) {
      throw new BadRequestError('Could not mark notification as seen');
    }
    return res;
  }

  async saveGameSettings(user_id: string, gameSettings: GameSettings) {
    const res = await this.userModel.saveGameSettings(user_id, gameSettings);
    if (!res) {
      throw new BadRequestError('Could not save game settings');
    }
    return res;
  }

  async getUserStats(user_id: string) {
    const res = await this.userModel.getUserStats(user_id);
    if (!res) {
      throw new NotFoundError('User stats not found');
    }
    return res;
  }
  async saveAudioSettings(user_id: string, audioSettings: GameAudioOptions) {
    const res = await this.userModel.saveAudioSettings(user_id, audioSettings);
    if (!res) {
      throw new BadRequestError('Could not save audio settings');
    }
    return res;
  }

  async saveGraphicsSettings(user_id: string, graphicsSettings: GraphicsSettings) {
    const res = await this.userModel.saveGraphicsSettings(user_id, graphicsSettings);
    if (!res) {
      throw new BadRequestError('Could not save graphics settings');
    }
    return res;
  }

  async getGraphicsSettings(user_id: string) {
    const res = await this.userModel.getGraphicsSettings(user_id);
    return res;
  }
}
