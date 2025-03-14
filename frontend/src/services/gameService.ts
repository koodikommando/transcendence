import { api } from './api';

interface QueueResponse {
  status: string;
  message: string;
}

interface GameIDResponse {
  game_id: string;
  status: string;
}

export async function enterQueue() {
  try {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      throw new Error('User ID not found');
    }
    const res = await api.get<QueueResponse>(`/matchmaking/enterQueue/${userID}`);
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.error('Failed to join game:', err);
    throw err;
  }
}

export async function getQueueStatus() {
  try {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      throw new Error('User ID not found');
    }
    const res = await api.get<QueueResponse>(`/matchmaking/status/${userID}`);
    console.log(res.data);
    return res.data.status;
  } catch (err) {
    console.error('Failed to get game status:', err);
    throw err;
  }
}

export async function getGameID() {
  try {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      throw new Error('User ID not found');
    }
    const res = await api.get<GameIDResponse>(`/matchmaking/getGameID/${userID}`);
    console.log(res);
    return res.data;
  } catch (err) {
    console.error('Failed to get game ID:', err);
    throw err;
  }
}

export async function singlePlayer(difficulty: string) {
  try {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      throw new Error('User ID not found');
    }
    const res = await api.get<GameIDResponse>(
      `/matchmaking/singlePlayer/${userID}?difficulty=${difficulty}`
    );
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.error('Failed to join single player game:', err);
    throw err;
  }
}

export async function submitResult(
  game_id: string,
  winner_id: string,
  loser_id: string,
  player1_score: number,
  player2_score: number
) {
  try {
    const res = await api.post(`/matchmaking/result`, {
      game_id,
      winner_id,
      loser_id,
      player1_score,
      player2_score,
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
