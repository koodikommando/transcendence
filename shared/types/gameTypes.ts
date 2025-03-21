export interface Player {
  id: string;
  y: number;
  dy: number;
  paddleHeight: number;
  score: number;
}

export interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  spin: number;
}

export interface GameState {
  players: { player1: Player; player2: Player };
  ball: Ball;
}

export interface GameParams {
  gameWidth: number;
  gameHeight: number;

  paddleWidth: number;
  paddleHeight: number;
  paddleSpeed: number;

  ballSize: number;
  ballSpeed: number;
  minBallDX: number;
  ballSpeedMultiplier: number;
  maxBallSpeedMultiplier: number;
  speedIncreaseFactor: number;

  maxSpin: number;
  spinCurveFactor: number;
  spinBounceFactor: number;
  spinIntensityFactor: number;
  spinReductionFactor: number;

  maxScore: number;
}

export const defaultGameParams: GameParams = {
  gameWidth: 800,
  gameHeight: 400,

  paddleWidth: 10,
  paddleHeight: 80,
  paddleSpeed: 10,

  ballSize: 10,
  ballSpeed: 7,
  minBallDX: 5,
  ballSpeedMultiplier: 1,
  maxBallSpeedMultiplier: 4,
  speedIncreaseFactor: 1.03, // Ball speed increase on paddle hit

  maxSpin: 15,
  spinCurveFactor: 0.0015, // Affects ball trajectory
  spinBounceFactor: 0.3, // Affects ball.dx on a wall bounce
  spinIntensityFactor: 0.8, // Player.dy * spinIntensity = spin change on paddle hit
  spinReductionFactor: 0.7, // Spin reduction on static surfaces

  maxScore: 10,
};

// Don't mind this for now
export interface PowerUp {
  id: number;
  x: number;
  y: number;
  active: boolean;
  affectedPlayer: number;
  type: 'bigger_paddle' | 'smaller_paddle' | 'extra_point';
}

export type GameStatus = 'loading' | 'waiting' | 'countdown' | 'playing' | 'paused' | 'finished';

export type GameEvent = 'game_goal' | 'player_joined' | 'player_left';
