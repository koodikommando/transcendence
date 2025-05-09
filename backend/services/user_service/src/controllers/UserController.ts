import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

import { FastifyReply, FastifyRequest } from 'fastify';

import '@fastify/jwt';

import { GameAudioOptions, GameSettings, defaultGameAudioOptions } from '@shared/types';

import { BadRequestError, NotFoundError } from '@my-backend/main_server';

import { UserService } from '../services/UserService';

export class UserController {
  private userService: UserService;
  private static instance: UserController;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  static getInstance(userService: UserService) {
    if (!UserController.instance) {
      UserController.instance = new UserController(userService);
    }
    return UserController.instance;
  }

  /**
   *  Fetch user by ID
   * @param request get: user_id as path parameter
   * @param reply 200 OK user : User object
   * @throws NotFoundError if user not found
   */
  async getUserByID(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.params as { user_id: string };
    request.log.trace(`Getting user ${user_id}`);
    const user = await this.userService.getUserByID(user_id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    reply.code(200).send(user);
  }

  /**
   * Fetch user data by ID
   * @param request get: user_id as path parameter
   * @param reply 200 OK user_data : User data object
   * @throws NotFoundError if user data not found
   */

  async getUserData(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.params as { user_id: string };
    request.log.trace(`Getting user data ${user_id}`);
    const userData = await this.userService.getUserData(user_id);
    if (!userData) {
      throw new NotFoundError('User data not found');
    }
    reply.code(200).send(userData);
  }

  /**
   * Fetch all users
   * @param request get
   * @param reply 200 OK users : Array of User objects
   * @throws NotFoundError if no users found
   */
  async getAllUsers(request: FastifyRequest, reply: FastifyReply) {
    request.log.trace(`Getting all users`);
    const { user_id } = request.user as { user_id: string };
    const users = await this.userService.getAllUsers(user_id);
    if (users.length === 0) {
      throw new NotFoundError('No users found');
    }
    reply.code(200).send(users);
  }

  /**
   * Fetch all users with rank
   * @param request get
   * @param reply 200 OK users : Array of User objects with rank
   * @throws NotFoundError if no users found
   */
  async getAllUsersWithRank(request: FastifyRequest, reply: FastifyReply) {
    request.log.trace(`Getting all users with rank`);
    const users = await this.userService.getAllUsersWithRank();
    if (users.length === 0) {
      throw new NotFoundError('No users found');
    }
    reply.code(200).send(users);
  }

  /**
   * Update user by ID with provided updates as request body
   * @param request put: user_id as path parameter, updates as request body
   * @param reply 200 OK user : Updated User object
   * @throws NotFoundError if user not found
   * @throws BadRequestError if no updates provided
   */
  async updateUserByID(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.params as { user_id: string };
    const updates = request.body as Partial<{
      display_name: string;
      first_name: string;
      last_name: string;
      bio: string;
      avatar_url: string;
      status: string;
      email: string;
    }>;
    request.log.trace(`Updating user ${user_id}`);
    if (!Object.keys(updates).length) {
      throw new BadRequestError('No updates provided');
    }
    request.log.trace(`Updates ${updates.status}`);
    const user = await this.userService.updateUserByID(user_id, updates);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    reply.code(200).send(user);
  }

  /**
   * Delete user by ID
   * @param request delete: user_id as path parameter
   * @param reply 204 OK message : User deleted successfully
   * @throws NotFoundError if user not found
   */
  async deleteUserByID(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.params as { user_id: string };
    request.log.trace(`Deleting user ${user_id}`);
    const user = await this.userService.deleteUserByID(user_id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    reply.code(204).send(user.changes);
  }

  /**
   *  Upload avatar for user by ID
   *  Avatar is saved in uploads directory
   *  Avatar URL is saved in user object
   * @param request post: user_id as path parameter, avatar as form-data
   * @param reply 200 OK user : Updated User object
   * @throws NotFoundError if user not found
   * @throws BadRequestError if no avatar provided
   */
  async uploadAvatar(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.user as { user_id: string };
    const avatar = await request.file();
    request.log.trace(`Uploading avatar for user ${user_id}`);
    if (!avatar) {
      throw new BadRequestError('No avatar provided');
    }
    const UPLOAD_DIR = path.normalize(process.env.UPLOAD_PATH || './uploads');
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    request.log.trace(`avatar name ${avatar.filename}`);
    const fileExtension = path.extname(avatar.filename);
    const fileName = `user${user_id}_${Date.now()}${fileExtension}`;

    const avatarPath = path.join(UPLOAD_DIR, fileName);
    await pipeline(avatar.file, fs.createWriteStream(avatarPath));

    const avatarURL = `/uploads/${fileName}`;
    const user = await this.userService.updateUserByID(user_id, { avatar_url: avatarURL });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    reply.code(200).send(user);
  }

  /**
   * Fetch notifications for user
   * @param request get
   * @param reply 200 OK notifications : Array of Notification objects
   * @throws NotFoundError if no notifications found
   */
  async getNotifications(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.user as { user_id: string };
    request.log.trace(`Getting notifications for user ${user_id}`);
    const notifications = await this.userService.getNotifications(user_id);
    reply.code(200).send(notifications);
  }

  async markNotificationAsSeen(request: FastifyRequest, reply: FastifyReply) {
    const { notification_id } = request.params as { notification_id: string };
    request.log.trace(`Marking notification ${notification_id} as seen`);
    const notification = await this.userService.markNotificationAsSeen(notification_id);
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }
    reply.code(200).send(notification);
  }

  async saveGameSettings(request: FastifyRequest, reply: FastifyReply) {
    const settings = request.body as GameSettings;
    console.log(request.body);
    const { user_id } = request.user as { user_id: string };
    request.log.trace(`Saving game settings for user ${user_id}`);
    request.log.trace(`Settings ${settings}`);
    request.log.trace(`Settings ${JSON.stringify(settings)}`);
    await this.userService.saveGameSettings(user_id, settings);
    reply.code(200).send({ status: 'saved' });
  }

  async getGameSettings(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.user as { user_id: string };
    request.log.trace(`Getting game settings for user ${user_id}`);
    const user = await this.userService.getUserByID(user_id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    const gameSettings = user.game_settings;
    reply.code(200).send(gameSettings);
  }

  async getMyStats(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.user as { user_id: string };
    request.log.trace(`Getting my stats for user ${user_id}`);
    const stats = await this.userService.getUserStats(user_id);
    reply.code(200).send(stats);
  }

  async getUserStats(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.params as { user_id: string };
    request.log.trace(`Getting stats for user ${user_id}`);
    const stats = await this.userService.getUserStats(user_id);
    reply.code(200).send(stats);
  }

  /**
   * Get audio settings for the authenticated user
   * @param request get
   * @param reply 200 OK audio_settings : GameAudioOptions object
   */
  async getAudioSettings(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { user_id } = request.user as { user_id: string };
      request.log.trace(`Getting audio settings for user ${user_id}`);

      const user = await this.userService.getUserByID(user_id);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      let audioSettings = user.audio_settings;
      if (!audioSettings) {
        audioSettings = defaultGameAudioOptions;
      } else {
        // Ensure all necessary fields exist
        audioSettings = {
          gameMusic: audioSettings.gameMusic || defaultGameAudioOptions.gameMusic,
          backgroundMusic: audioSettings.backgroundMusic || defaultGameAudioOptions.backgroundMusic,
          soundEffects: audioSettings.soundEffects || defaultGameAudioOptions.soundEffects,
          uiSounds: audioSettings.uiSounds || defaultGameAudioOptions.uiSounds,
        };
      }

      reply.code(200).send(audioSettings);
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  }

  /**
   * Save audio settings for the authenticated user
   * @param request post: audio_settings in request body
   * @param reply 200 OK status : saved
   */
  async saveAudioSettings(request: FastifyRequest, reply: FastifyReply) {
    try {
      const settings = request.body as GameAudioOptions;
      const { user_id } = request.user as { user_id: string };

      request.log.trace(`Saving audio settings for user ${user_id}`);
      request.log.trace(`Settings: ${JSON.stringify(settings)}`);

      if (settings.gameMusic && typeof settings.gameMusic.volume === 'number') {
        settings.gameMusic.volume = Math.max(0, Math.min(1, settings.gameMusic.volume));
      }

      if (settings.backgroundMusic && typeof settings.backgroundMusic.volume === 'number') {
        settings.backgroundMusic.volume = Math.max(0, Math.min(1, settings.backgroundMusic.volume));
      }

      if (settings.soundEffects && typeof settings.soundEffects.volume === 'number') {
        settings.soundEffects.volume = Math.max(0, Math.min(1, settings.soundEffects.volume));
      }

      if (settings.uiSounds && typeof settings.uiSounds.volume === 'number') {
        settings.uiSounds.volume = Math.max(0, Math.min(1, settings.uiSounds.volume));
      }

      await this.userService.saveAudioSettings(user_id, settings);

      reply.code(200).send({ status: 'saved' });
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  }
}
