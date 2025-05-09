import { useEffect, useRef } from 'react';

import { useNavigate } from 'react-router-dom';

import { useGameOptionsContext, useUser, useWebSocketContext } from '@contexts';

import { MatchMaker, MatchMakerState, SessionManager } from '@services';
import { useRouteExitCleanup } from './useRouteExitCleanup';

export const useMatchmaking = () => {
  const navigate = useNavigate();
  const { userId, user } = useUser();
  const {
    // matchmakingState,
    // matchmakingSocket,
    sendMessage,
    // closeConnection,
    connections,
    setGameId,
    // startGame,
    startMatchMaking,
    // startSpectating,
  } = useWebSocketContext();

  const { mode, difficulty, lobby, queueId, tournamentOptions, setQueueId } =
    useGameOptionsContext(); // resetGameOptions

  const matchmaker = useRef<MatchMaker>(null);
  const sessionManager = SessionManager.getInstance();
  const hasRegistered = sessionManager.get('matchmakingRegistered');

  
  // const params = useRef<URLSearchParams>(new URLSearchParams());

  // useEffect(() => {
  //   if (!mode || !difficulty) return;
  //   params.current = new URLSearchParams({ mode: mode, difficulty: difficulty });
  // }, [mode, difficulty]);

  // useEffect(() => {
  //   if (matchmakingState.phase === 'in_game') {
  //     navigate('/game');
  //   }
  //   if (matchmakingState.phase === 'spectating') {
  //     navigate('/game');
  //   }
  // }, [matchmakingState.phase]);

  useEffect(() => {
    if (!mode || !difficulty || !lobby) return;
    console.log('Setting matchmaker:', mode, difficulty);
    matchmaker.current = new MatchMaker({ mode, difficulty, lobby, queueId, tournamentOptions });
  }, [mode, difficulty, lobby]);

  const handleFindMatch = () => {
    console.log('Finding match');
    sendMessage('matchmaking', {
      type: 'find_match',
      payload: {
        mode: mode,
        difficulty: difficulty,
        user_id: userId,
        avatar_url: user?.avatar_url,
        display_name: user?.display_name,
      },
    });
  };

  const handleJoinMatch = () => {
    console.log('Joining match');
    if (!matchmaker.current) return;
    sendMessage('matchmaking', {
      type: 'join_match',
      payload: {
        queue_id: sessionManager.get('queueId'),
        user_id: userId,
        mode: mode,
        difficulty: difficulty,
        avatar_url: user?.avatar_url,
        display_name: user?.display_name,
      },
    });
  };

  // const handleGameStart = () => {
  //   if (!matchmaker.current) return;
  //   console.log('Game started');
  //   setGameId(matchmaker.current.getGameId()!);
  //   // navigate('/game');
  //   // gameSocket.connect(params.current);
  // };

  // const handleMatchFound = useCallback((game: any) => {
  //   if (!matchmaker.current) return;
  //   console.log('Match found:', game);
  //   // closeConnection('matchmaking');
  //   matchmaker.current.setMatchMakerState(MatchMakerState.MATCHED);
  //   setGameId(game.game_id);
  //   // navigate('/game');
  //   // gameSocket.connect(params.current);
  // }, []);

  // const handleGameWinner = useCallback(() => {
  //   if (!matchmakingSocket) return;
  //   console.log('Game winner');
  //   if (mode === 'tournament') {
  //     console.log('Tournament mode, no need to close connection');
  //     matchmaker.current?.setMatchMakerState(MatchMakerState.MATCHED);
  //   } else {
  //     console.log('Closing game connection');
  //     matchmaker.current?.setMatchMakerState(MatchMakerState.SEARCHING);
  //     navigate('/home');
  //   }
  // }, [mode, matchmakingSocket]);

  // const handleGameLoser = useCallback(() => {
  //   if (!matchmakingSocket) return;
  //   console.log('Game loser');
  //   matchmaker.current?.setMatchMakerState(MatchMakerState.SEARCHING);
  //   navigate('/home');
  // }, [matchmakingSocket]);

  useEffect(() => {
    if (!userId || !matchmaker.current || hasRegistered) return;
    console.log('Starting matchmaking');
    console.log('mode:', mode, 'difficulty:', difficulty, 'lobby:', lobby, 'queueId:', queueId);
    matchmaker.current
      .startMatchMake()
      .then(() => {
        if (!matchmaker.current) return;
        sessionManager.set('matchmakerState', matchmaker.current.getMatchMakerState());
        console.log('Matchmaker state:', matchmaker.current.getMatchMakerState());
        switch (matchmaker.current.getMatchMakerState()) {
          case MatchMakerState.MATCHED:
            console.log('Matched with a game');
            setGameId(matchmaker.current.getGameId()!);
            sessionManager.set('gameId', matchmaker.current.getGameId()!);
            break;
          case MatchMakerState.WAITING_FOR_PLAYERS:
          case MatchMakerState.JOINING_RANDOM:
            console.log('Waiting for players');
            console.log('state', matchmaker.current.getMatchMakerState());
            setQueueId(matchmaker.current.getQueueId()!);
            sessionManager.set('queueId', matchmaker.current.getQueueId()!);
            startMatchMaking();
            // params.current.set('queue_id', matchmaker.current.getQueueId() || '');
            // matchmakingSocket.connect(params.current);
            break;
          default:
            console.error('Invalid matchmaker state');
            break;
        }
      })
      .catch((err) => {
        console.error('Matchmaking failed:', err);
        navigate('/home');
      })
      .finally(() => {
        sessionManager.set('matchmakingRegistered', true);
      });
  }, [userId]);

  useEffect(() => {
    console.log('connections.matchmaking:', connections.matchmaking);
    if (connections.matchmaking !== 'connected' && sessionManager.get('matchmakingRegistered')) {
      console.log('In queue, recovering session');
      matchmaker.current?.setMatchMakerState(MatchMakerState.WAITING_FOR_PLAYERS);
      startMatchMaking();
    }
  }, [connections.matchmaking]);

  // sending a message when the matchmaking connection is established
  useEffect(() => {
    if (connections.matchmaking !== 'connected' || !sessionManager.get('matchmakingRegistered')) {
      console.log('In queue, recovering sessionasdfadf');
      return;
    }
    switch (sessionManager.get('matchmakerState')) {
      case MatchMakerState.WAITING_FOR_PLAYERS:
        handleJoinMatch();
        break;
      case MatchMakerState.JOINING_RANDOM:
        handleFindMatch();
        break;
      case MatchMakerState.MATCHED:
        console.log('Matched with a game');
        break;
      default:
        console.error('Invalid matchmaker state');
        break;
    }
  }, [connections.matchmaking]);

  // useEffect(() => {
  //   console.log('Attaching matchmaking event listeners');
  //   matchmakingSocket.addEventListener('match_found', handleMatchFound);
  //   matchmakingSocket.addEventListener('game_winner', handleGameWinner);
  //   matchmakingSocket.addEventListener('game_loser', handleGameLoser);

  //   return () => {
  //     console.log('Detaching matchmaking event listeners');
  //     matchmakingSocket.removeEventListener('match_found', handleMatchFound);
  //     matchmakingSocket.removeEventListener('game_winner', handleGameWinner);
  //     matchmakingSocket.removeEventListener('game_loser', handleGameLoser);
  //   };
  // }, []);
};
