import React, { useEffect, useState } from 'react';

import { useLocation } from 'react-router-dom';

import { useLoading } from '@/contexts/gameContext/LoadingContextProvider';

import { CountDown, GameCanvas, PlayerScoreBoard } from '@components';

import { useGameControls, useGameResult, useGameUser, useMatchmaking } from '@hooks';

import { createReadyInputMessage } from '@shared/messages';

import { MatchMakingCarousel } from '../components/game/MatchMakingCarousel';
import { useWebSocketContext } from '../contexts/WebSocketContext';
import { useFetchPlayerData } from '../hooks/useFetchPlayers';

export const GamePage: React.FC = () => {
  const { setUrl, gameState, gameStatus, connections, dispatch, sendMessage } =
    useWebSocketContext();

  const location = useLocation();
  const { loadingStates } = useLoading();
  const { mode, difficulty, lobby } = location.state || {};
  const [animate, setAnimate] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  //const [userId, setUserId] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  // const [localPlayerId, setLocalPlayerId] = useState<string | null>(null);
  //const [remotePlayerId, setRemotePlayerId] = useState<string | null>(null);

  const { userId, localPlayerId, remotePlayerId } = useGameUser(difficulty);
  useMatchmaking(mode, difficulty, lobby, setGameId, userId);
  useGameResult(gameStatus, gameId, gameState, dispatch, userId);
  useGameControls(localPlayerId, remotePlayerId);

  const playersData = useFetchPlayerData({
    gameState,
    gameId,
    mode,
    difficulty,
    connectionStatus: connections.game,
    gameStatus,
  });

  // MAKE SURE THAT THE MATCHMAKING CAROUSEL HAS FINISHED, AND THAT PLAYER SCOREBOARD IS INITALIZED
  // SET LOADING TO FALSE TO RENDER THE GAMECANVAS
  useEffect(() => {
    if (!gameId) return;
    if (!loadingStates.matchMakingAnimationLoading && !loadingStates.scoreBoardLoading) {
      setLoading(false);
    }
  }, [animate, loadingStates]);

  useEffect(() => {
    if (!gameId || !localPlayerId) return;
    if (!loading && gameStatus === 'waiting') {
      console.log('sending player ready for player: ', localPlayerId);
      sendMessage('game', createReadyInputMessage(localPlayerId, true));
    }
  }, [loading, gameStatus]);

  // TODO: Reconnection handler
  // TODO: Pause - Resume

  return (
    <div id="game-page" className="w-full p-10 pt-0 flex flex-col overflow-hidden">
      {!loadingStates.matchMakingAnimationLoading ? (
        <PlayerScoreBoard playersData={playersData} />
      ) : null}
      {connections.game === 'connected' && gameStatus !== 'finished' && !loading ? (
        <>
          <div className="w-full h-full relative overflow-hidden">
            {/* RENDER COUNTDOWN CONDITIONALLY */}
            <CountDown gameStatus={gameStatus} />

            <p className="text-xs text-gray-500">
              Connection: {connections.game} | Game: {gameStatus} | Spin: {gameState.ball.spin} |
              Player2_DY: {gameState.players.player2.dy}
            </p>
            <GameCanvas gameState={gameState} />
          </div>
        </>
      ) : (
        <MatchMakingCarousel setAnimate={setAnimate} gameId={gameId} playersData={playersData} />
      )}
    </div>
  );
};

export default GamePage;

// <div className="flex flex-col items-center justify-center h-full gap-4">
//   <p>{getStatusMessage()}</p>
//   <ClipLoader
//     color={'primary'}
//     size={50}
//     aria-label="Loading Spinner"
//     data-testid="loader"
//   />
// </div>
