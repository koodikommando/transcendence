// Import environment variables
import cookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';
import Swagger from '@fastify/swagger';
import SwaggerUi from '@fastify/swagger-ui';
import dotenv from 'dotenv';
import fastify from 'fastify';

import 'module-alias/register';

import matchMakingService from '@my-backend/matchmaking_service/';
import remoteService from '@my-backend/remote_service/';
import userService from '@my-backend/user_service/';

import databasePlugin from './db';
import authPlugin from './middlewares/auth';
import errorHandlerPlugin from './middlewares/errorHandler';
import loggerPlugin from './middlewares/logger';
import adminRoutes from './routes/adminRoutes';

export * from './middlewares/errorHandler';
export * from './middlewares/errors';

dotenv.config();

// Create Fastify instance
const app = fastify({
  logger: {
    level: 'trace',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname,v,reqId',
        singleLine: true,
        destination: process.env.LOG_PATH,
      },
    },
  },
});

const start = async () => {
  try {
    // Register fastify-jwt plugin with secret from env variables
    app.register(Swagger, {
      swagger: {
        info: {
          title: 'My API',
          description: 'API documentation',
          version: '1.0.0',
        },
        externalDocs: {
          url: 'https://swagger.io',
          description: 'Find more info here',
        },
        host: 'localhost:8443',
        schemes: ['https'],
        consumes: ['application/json'],
        produces: ['application/json'],
      },
    });

    app.register(SwaggerUi, {
      routePrefix: '/docs', // Swagger UI is served at /docs
    });
    app.register(fastifyJwt, {
      secret: process.env.JWT_SECRET || 'defaultsecret',
      cookie: {
        cookieName: 'refreshToken', // Name of the cookie storing refresh token
        signed: false, // We are not signing cookies separately
      },
    });
    app.register(cookie, {
      // Register fastify-cookie plugin
      parseOptions: {
        httpOnly: true, // Prevent JavaScript access (security best practice)
        sameSite: 'strict', // Restrict cross-site access
        secure: true, // Only send over HTTPS
        path: '/api/auth/refresh', // Available for all routes
      },
    });

    // register error handler
    app.register(errorHandlerPlugin);
    // Register logger
    app.register(loggerPlugin);
    // Register authentication of JWT
    app.register(authPlugin);
    // Initialize database
    app.register(databasePlugin);
    // Register routes
    app.register(adminRoutes, { prefix: '/api' }); // Register admin routes
    app.register(userService, { prefix: '/api' }); // Register user routes inside the plugin
    app.register(matchMakingService, { prefix: '/api' }); // Register matchmaking routes inside the plugin
    app.register(remoteService, { prefix: '/ws' }); // Register remote routes inside the plugin

    // Handle uncaught exceptions (prevents crashes)
    process.on('uncaughtException', (error) => {
      console.error('🔥 Uncaught Exception:', error);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.warn('⚠️ Unhandled Promise Rejection at:', promise, 'Reason:', reason);
    });

    await app.listen({ port: Number(process.env.BACKEND_PORT) || 8000, host: '0.0.0.0' });
    app.log.info(`Server running on port ${process.env.BACKEND_PORT || 8000}`);
    console.log(`Server running on port ${process.env.BACKEND_PORT || 8000}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
