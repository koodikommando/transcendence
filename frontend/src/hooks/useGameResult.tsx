import { useEffect, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useGameOptionsContext, useLoading, useUser, useWebSocketContext } from '@contexts';

import { submitResult } from '@services';

import { GameState } from '@shared/types';

export const useGameResult = () => {
  const navigate = useNavigate();
  const { mode } = useGameOptionsContext(); // resetGameOptions,
  const {
    closeConnection,
    gameStatus,
    gameState,
    dispatch,
    matchmakingState: { gameId },
    setGameId,
    // cleanup,
  } = useWebSocketContext();
  const { setLoadingState } = useLoading();
  const { userId } = useUser();
  const gameIdRef = useRef<string | null>(null);
  const gameStateRef = useRef<GameState>(gameState);
  const userIdRef = useRef(userId);
  const gameStatusRef = useRef(gameStatus);
  const hasSubmittedResult = useRef(false);

  const [gameResult, setGameResult] = useState<any | null>(null);

  useEffect(() => {
    if (!userId) return;
    userIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    if (!gameId) return;
    gameIdRef.current = gameId;
  }, [gameId]);

  useEffect(() => {
    if (!gameStatus) return;
    gameStatusRef.current = gameStatus;
  }, [gameStatus]);

  useEffect(() => {
    if (!gameState) return;
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    if (
      gameStateRef.current &&
      gameStatusRef.current &&
      gameStatusRef?.current === 'finished' &&
      !hasSubmittedResult.current
    ) {
      console.log('Game finished, submitting result');
      const { players } = gameStateRef.current;
      const sortedPlayers = [players.player1, players.player2].sort((a, b) => b.score - a.score);
      console.log('Submitting game result:', gameId, sortedPlayers);
      const result = {
        game_id: gameId,
        winner_id: sortedPlayers[0].id,
        loser_id: sortedPlayers[1].id,
        winner_score: sortedPlayers[0].score,
        loser_score: sortedPlayers[1].score,
        game_mode: mode,
      };
      setGameResult(result);
      dispatch({ type: 'GAME_RESET' });
      setLoadingState('matchMakingAnimationLoading', true);
      setLoadingState(' scoreBoardLoading', true);
      // cleanup();
      // resetGameOptions();
      closeConnection('game');
      if (mode !== 'tournamnet') {
        // navigate('/gameMenu');
      }
      hasSubmittedResult.current = true;
    }
  }, [gameStatus, dispatch, navigate]);

  //   useEffect(() => {
  //     if (!gameId) return;
  //     if (gameStatusRef.current === 'finished' && !hasSubmittedResult.current) {
  //       if (gameId === 'local_game_id') {
  //         console.log('Local game, no need to submit result');
  //         dispatch({ type: 'GAME_RESET' });
  //         navigate('/home');
  //         return;
  //       }
  //       const { players } = gameStateRef.current;
  //       const sortedPlayers = [players.player1, players.player2].sort((a, b) => b.score - a.score);
  //       console.log('Submitting game result:', gameId, sortedPlayers);
  //       submitResult({
  //         game_id: gameId,
  //         winner_id: sortedPlayers[0].id,
  //         loser_id: sortedPlayers[1].id,
  //         winner_score: sortedPlayers[0].score,
  //         loser_score: sortedPlayers[1].score,
  //       })
  //         .then(() => {
  //           dispatch({ type: 'GAME_RESET' });
  //           hasSubmittedResult.current = true;
  //         })
  //         .catch((err) => {
  //           console.error('Error submitting game result:', err);
  //         })
  //         .finally(() => {
  //           navigate('/home');
  //         });
  //     }
  //   }, [gameStatus, gameId, gameState, dispatch, navigate]);

  // Cleanup
  useEffect(() => {
    return () => {
      console.log('Cleanup');
      if (!gameIdRef.current || hasSubmittedResult.current || !gameStateRef.current) return;
      if (gameIdRef.current === 'local_game_id') {
        dispatch({ type: 'GAME_RESET' });
        // cleanup();
        // resetGameOptions();
        if (mode !== 'tournamnet') {
          // navigate('/gameMenu');
        }
        return;
      }
      console.log('Submitting game result:', gameIdRef.current);
      // closeConnection('game');
      const { players } = gameStateRef.current;
      const playerArray = [players.player1, players.player2];
      const winnerIndex = playerArray.findIndex((e) => e.id !== userIdRef.current);
      const loserIndex = winnerIndex === 0 ? 1 : 0;

      console.log('Submitting game result:', gameResult);
      submitResult({
        game_id: gameIdRef.current,
        winner_id: playerArray[winnerIndex].id,
        loser_id: playerArray[loserIndex].id,
        winner_score: playerArray[winnerIndex].score,
        loser_score: playerArray[loserIndex].score,
      })
        .then(() => {
          dispatch({ type: 'GAME_RESET' });
        })
        .catch((err) => {
          console.error('Error submitting game result:', err);
        })
        .finally(() => {
          // resetGameOptions();
          closeConnection('game');
          setGameId('');
          // cleanup();
          if (mode !== 'tournamnet') {
            // navigate('/gameMenu');
          }
        });
    };
  }, []);

  return { gameResult };
};
