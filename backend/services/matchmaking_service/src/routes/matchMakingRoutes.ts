import { FastifyInstance } from 'fastify';
import { MatchMakingController } from '../controllers/matchMakingControllers';
import { MatchMakingService } from '../services/matchMakingServices';

export async function matchMakingRoutes(fastify: FastifyInstance) {
  // Here we assume fastify.db has been decorated on the instance.
  const matchMakingService = new MatchMakingService(fastify.db);
  const matchMakingController = new MatchMakingController(matchMakingService);

  fastify.get('/all', matchMakingController.getQueues.bind(matchMakingController));
  fastify.get('/status/:user_id', matchMakingController.getStatusQueue.bind(matchMakingController));
  fastify.get('/enterQueue/:user_id', matchMakingController.enterQueue.bind(matchMakingController));
  fastify.get(
    '/singlePlayer/:user_id',
    matchMakingController.singlePlayer.bind(matchMakingController)
  );
  fastify.get('/getGameID/:user_id', matchMakingController.getGameID.bind(matchMakingController));
  fastify.delete('/cancel/:user_id', matchMakingController.cancelQueue.bind(matchMakingController));
  fastify.post('/result', matchMakingController.resultGame.bind(matchMakingController));
}
