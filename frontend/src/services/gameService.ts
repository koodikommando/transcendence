import { api } from '@services';

import {
  GameIdType,
  GameResType,
  GameResultReqType,
  GameResultResType,
  GameSinglePlayerResType,
  QueueStatusResType,
  SessionStatusType,
} from '@shared/types';

type CreateQueueParams = {
  mode: string;
  difficulty: string;
  name: string;
  password: string | null;
};

export async function createQueue(options: CreateQueueParams) {
  const { mode, difficulty, name, password } = options;
  try {
    const res = await api.post<QueueStatusResType>(
      `/matchmaking/createQueue?mode=${mode}&difficulty=${difficulty}&name=${name}`,
      { password }
    );
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.error('Failed to join game:', err);
    throw err;
  }
}

export async function getSessionStatus({
  game_id,
  queue_id,
}: {
  game_id: string;
  queue_id: string;
}) {
  try {
    const res = await api.get<SessionStatusType>(
      `/game/sessionStatus?game_id=${game_id}&queue_id=${queue_id}`
    );
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.error('Failed to get session status:', err);
    throw err;
  }
}

export async function getStatusQueue() {
  try {
    const res = await api.get<QueueStatusResType>(`/matchmaking/status`);
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.error('Failed to get queue status:', err);
    throw err;
  }
}

export async function getStatusGame() {
  try {
    const res = await api.get(`/game/status`);
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.error('Failed to get game status:', err);
    throw err;
  }
}

export async function cancelQueue() {
  try {
    const res = await api.delete<CanPlayTypeResult>(`/matchmaking/cancel`);
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.error('Failed to cancel queue:', err);
    throw err;
  }
}

type joinQueueParams = {
  queueId: string;
  mode: string;
  difficulty: string;
  password: string | null;
};
export async function joinQueue(options: joinQueueParams) {
  const { queueId, mode, difficulty, password } = options;
  try {
    const res = await api.post<QueueStatusResType>(
      `/matchmaking/joinQueue/${queueId}?mode=${mode}&difficulty=${difficulty}`,
      { password }
    );
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.error('Failed to join queue:', err);
    throw err;
  }
}
export async function getQueueStatus() {
  try {
    const res = await api.get<QueueStatusResType>(`/matchmaking/status`);
    console.log(res.data);
    return res.data.status;
  } catch (err) {
    console.error('Failed to get game status:', err);
    throw err;
  }
}

export async function getGameID() {
  try {
    const res = await api.get<GameIdType>(`/game/getGameID`);
    console.log(res);
    return res.data;
  } catch (err) {
    console.error('Failed to get game ID:', err);
    throw err;
  }
}

export async function getGame(game_id: string) {
  try {
    const res = await api.get<GameResType>(`/game/getGame/${game_id}`);
    console.log(res);
    return res.data;
  } catch (err) {
    console.error('Failed to get game:', err);
    throw err;
  }
}

export async function singlePlayer(difficulty: string) {
  try {
    const res = await api.post<GameSinglePlayerResType>(
      `/game/singlePlayer?difficulty=${difficulty}`
    );
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.error('Failed to join single player game:', err);
    throw err;
  }
}

export async function submitResult({
  game_id,
  winner_id,
  loser_id,
  winner_score,
  loser_score,
}: GameResultReqType) {
  try {
    console.log(game_id, winner_id, loser_id, winner_score, loser_score);
    const res = await api.post<GameResultResType>(`/game/result`, {
      game_id,
      winner_id,
      loser_id,
      winner_score,
      loser_score,
    });
    if (res.status !== 200) {
      throw new Error(`Error ${res.status}: Failed to submit result`);
    }
    return res.data;
  } catch (err) {
    console.error('Failed to submit result:', err);
    throw err;
  }
}

export async function deleteGame(game_id: string) {
  try {
    const res = await api.delete<GameResultResType>(`/game/delete/${game_id}`);
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.error('Failed to delete game:', err);
    throw err;
  }
}


export async function getQueuePlayers(queue_id: string) {
  try {
    const res = await api.get(`/matchmaking/layers/${queue_id}`);
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.error('Failed to get queue players:', err);
    throw err;
  }
}