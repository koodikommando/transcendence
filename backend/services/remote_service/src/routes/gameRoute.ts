import { FastifyInstance } from 'fastify';
import * as WebSocket from 'ws';

import { GameManager } from '@my-backend/game_service';

import { GameController } from '../controllers/GameController';

export async function gameRoutes(fastify: FastifyInstance) {
  // Here we assume fastify.db has been decorated on the instance.
  const gameManager = GameManager.getInstance();
  const gameController = GameController.getInstance(gameManager);

  fastify.get('/game/', { websocket: true }, (socket: WebSocket.WebSocket, request) =>
    gameController.play.bind(gameController)(socket, request)
  );
}
