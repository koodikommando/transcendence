import { GameState, GameStatus, GameParams, defaultGameParams } from '@shared/types';

type PlayerMove = 'up' | 'down' | null;

export default class PongGame {
  private params: GameParams = defaultGameParams;

  private gameState: GameState;
  private gameStatus: GameStatus;
  private updateInterval: NodeJS.Timeout | null = null;

  private player1Id: string | null = null;
  private player2Id: string | null = null;

  private mode: string;
  private difficulty: string;

  private readyState = new Map<string, boolean>();

  private frameCount = 0;

  constructor(mode: string, difficulty: string) {
    this.mode = mode;
    this.difficulty = difficulty;
    this.gameState = {
      players: {
        player1: {
          id: '',
          y: this.params.gameHeight / 2 - this.params.paddleHeight / 2,
          dy: 0,
          paddleHeight: this.params.paddleHeight,
          score: 0,
        },
        player2: {
          id: '',
          y: this.params.gameHeight / 2 - this.params.paddleHeight / 2,
          paddleHeight: this.params.paddleHeight,
          dy: 0,
          score: 0,
        },
      },
      ball: { x: 0, y: 0, dx: 0, dy: 0, spin: 0 },
    };
    this.gameStatus = 'loading';
    this.resetBall();
  }

  addPlayer(playerId: string): void {
    if (!this.player1Id) {
      console.log('Adding player1:', playerId);
      this.player1Id = playerId;
      this.gameState.players.player1.id = playerId;
      this.readyState.set('player1', false);
    } else if (!this.player2Id) {
      console.log('Adding player2:', playerId);
      this.player2Id = playerId;
      this.gameState.players.player2.id = playerId;
      this.readyState.set('player2', false);
    } else {
      throw new Error('Cannot add more than 2 players');
    }
  }

  setReadyState(playerId: string, state: boolean): void {
    if (playerId === this.player1Id) {
      //console.log('Setting player1 ready state:', state);
      this.readyState.set('player1', state);
    } else if (playerId === this.player2Id) {
      console.log('Setting player2 ready state:', state);
      this.readyState.set('player2', state);
    }
    if (this.areAllPlayersReady()) {
      //console.log('All players are ready!');
      this.startCountdown();
    } else {
      console.log('Not all players are ready');
      console.log('Player 1 ready:', this.readyState.get('player1'));
      console.log('Player 2 ready:', this.readyState.get('player2'));
    }
  }

  areAllPlayersReady(): boolean {
    if (this.mode === 'singleplayer' || (this.mode === '1v1' && this.difficulty === 'local')) {
      if (this.readyState.get('player1')) {
        return true;
      }
    } else if (this.mode === '1v1' && this.difficulty === 'online') {
      if (this.readyState.get('player1') && this.readyState.get('player2')) {
        return true;
      }
    }
    return false;
  }

  getGameStatus(): GameStatus {
    return this.gameStatus;
  }
  getGameState(): GameState {
    return this.gameState;
  }
  getPaddleSpeed() {
    return this.params.paddleSpeed;
  }
  getHeight() {
    return this.params.gameHeight;
  }
  getWidth() {
    return this.params.gameWidth;
  }
  getPaddleHeight(player: number): number {
    if (player === 1) {
      return this.gameState.players.player1.paddleHeight;
    } else {
      return this.gameState.players.player2.paddleHeight;
    }
  }

  getPlayerId(player: number): string | null {
    if (player === 1) {
      return this.player1Id;
    } else {
      return this.player2Id;
    }
  }

  setPlayerId(player: number, playerId: string): void {
    if (player === 1) {
      this.player1Id = playerId;
      this.gameState.players.player1.id = playerId;
    } else {
      this.player2Id = playerId;
      this.gameState.players.player2.id = playerId;
    }
  }

  setPaddleHeight(player: number, height: number): void {
    this.repositionPaddleAfterHeightChange(player, height);
    if (player === 1) {
      this.gameState.players.player1.paddleHeight = height;
    } else {
      this.gameState.players.player2.paddleHeight = height;
    }
  }

  private repositionPaddleAfterHeightChange(player: number, height: number): void {
    if (player === 1) {
      if (height > this.gameState.players.player1.paddleHeight) {
        this.gameState.players.player1.y -=
          (height - this.gameState.players.player1.paddleHeight) / 2;
        if (this.gameState.players.player1.y < 0) {
          this.gameState.players.player1.y = 0;
        } else if (this.gameState.players.player1.y + height > this.params.gameHeight) {
          this.gameState.players.player1.y = this.params.gameHeight - height;
        }
      } else {
        this.gameState.players.player1.y += this.gameState.players.player1.paddleHeight - height;
      }
    } else {
      if (height > this.gameState.players.player2.paddleHeight) {
        this.gameState.players.player2.y -= height - this.gameState.players.player2.paddleHeight;
      } else {
        this.gameState.players.player2.y += this.gameState.players.player2.paddleHeight - height;
      }
    }
  }

  private resetBall(): void {
    this.params.ballSpeedMultiplier = 1;

    // Random starting angle between -30° and 30°
    const angle = (Math.random() * Math.PI) / 3 - Math.PI / 6;

    // Randomly choose left or right direction
    const direction = Math.random() > 0.5 ? 1 : -1;

    this.gameState.ball = {
      x: this.params.gameWidth / 2,
      y: this.params.gameHeight / 2,
      dx: direction * this.params.ballSpeed * Math.cos(angle),
      dy: this.params.ballSpeed * Math.sin(angle),
      spin: 0,
    };
  }

  private resetPaddles(): void {
    this.gameState.players.player1.y = this.params.gameHeight / 2 - this.params.paddleHeight / 2;
    this.gameState.players.player2.y = this.params.gameHeight / 2 - this.params.paddleHeight / 2;
  }

  startCountdown(): void {
    if (!this.areAllPlayersReady()) {
      console.warn('Cannot start countdown — not all players are ready.');
      return;
    }
    //console.log('Starting countdown...');
    this.setGameStatus('countdown');
    this.resetBall();
    this.resetPaddles();

    setTimeout(() => {
      this.setGameStatus('playing');
      this.startGameLoop();
    }, 3000);
  }

  startGameLoop(): void {
    // Prevent multiple intervals
    if (this.updateInterval) return;
    this.updateInterval = setInterval(() => {
      if (this.gameStatus === 'playing') {
        this.updateBall();
      }
    }, 1000 / 60); // 60 fps
  }

  updateGameState(playerMoves: { player1?: PlayerMove; player2?: PlayerMove }): GameState {
    if (this.gameStatus !== 'playing') {
      return this.getGameState();
    }

    // Update player positions based on moves
    this.updatePaddlePosition('player1', playerMoves.player1 ?? null);
    this.updatePaddlePosition('player2', playerMoves.player2 ?? null);

    // Return the updated state (deep copy for safety)
    return this.getGameState();
  }

  private updatePaddlePosition(player: 'player1' | 'player2', move: PlayerMove): void {
    if (this.gameStatus !== 'playing') return;

    let paddleState;
    if (player === 'player1') {
      paddleState = this.gameState.players.player1;
    } else {
      paddleState = this.gameState.players.player2;
    }

    if (move === 'up') {
      paddleState.y -= this.params.paddleSpeed;
      if (paddleState.y < 0) {
        paddleState.y = 0;
        paddleState.dy = 0;
      } else {
        paddleState.dy = -this.params.paddleSpeed;
      }
    } else if (move === 'down') {
      paddleState.y += this.params.paddleSpeed;
      if (paddleState.y + this.params.paddleHeight > this.params.gameHeight) {
        paddleState.y = this.params.gameHeight - this.params.paddleHeight;
        paddleState.dy = 0;
      } else {
        paddleState.dy = this.params.paddleSpeed;
      }
    } else if (move === null) {
      // this.frameCount++;
      // if (this.frameCount % 6 === 0) {
      //   paddleState.dy = 0;
      //   this.frameCount = 0;
      // }
      paddleState.dy = 0;
    }
  }

  private updateBall(): void {
    if (this.gameStatus !== 'playing') return;

    const { ball, players } = this.gameState;

    this.adjustBallMovementForSpin();
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top wall collision
    if (ball.y <= 0) {
      // Prevent going inside the wall
      ball.y = 0;
      ball.dy *= -1;
      this.adjustBounceForSpin(true);
    }

    // Bottom wall collision
    if (ball.y + this.params.ballSize >= this.params.gameHeight) {
      // Prevent going inside the wall
      ball.y = this.params.gameHeight - this.params.ballSize;
      ball.dy *= -1;
      // Spin effect
      this.adjustBounceForSpin(false);
    }

    this.checkPaddleCollision();

    if (ball.x <= 0) {
      players.player2.score++;
      if (players.player2.score >= this.params.maxScore) {
        this.stopGame();
      } else {
        this.setGameStatus('waiting');
      }
    } else if (ball.x + this.params.ballSize >= this.params.gameWidth) {
      players.player1.score++;
      if (players.player1.score >= this.params.maxScore) {
        this.stopGame();
      } else {
        this.setGameStatus('waiting');
      }
    }
  }

  private adjustBallMovementForSpin(): void {
    const { ball } = this.gameState;
    if (ball.spin === 0) return;

    if (ball.dx > 0) {
      ball.dy += ball.spin * this.params.spinCurveFactor * ball.dx;
    } else {
      ball.dy -= ball.spin * this.params.spinCurveFactor * ball.dx * -1;
    }
  }

  private adjustBounceForSpin(isTopWall: boolean): void {
    const { ball } = this.gameState;
    if (ball.spin === 0) return;

    if (ball.dx > 0) {
      if (isTopWall) {
        ball.dx -= ball.spin * this.params.spinBounceFactor;
      } else {
        ball.dx += ball.spin * this.params.spinBounceFactor;
      }
      if (ball.dx < this.params.minBallDX) ball.dx = this.params.minBallDX;
    } else {
      if (isTopWall) {
        ball.dx -= ball.spin * this.params.spinBounceFactor;
      } else {
        ball.dx += ball.spin * this.params.spinBounceFactor;
      }
      if (ball.dx > -this.params.minBallDX) ball.dx = -this.params.minBallDX;
    }
    ball.spin *= this.params.spinReductionFactor;
    if (Math.abs(ball.spin) < 0.1) ball.spin = 0;
  }

  private checkPaddleCollision(): void {
    const { ball, players } = this.gameState;

    if (
      ball.x <= this.params.paddleWidth &&
      ball.y + this.params.ballSize >= players.player1.y &&
      ball.y <= players.player1.y + this.params.paddleHeight
    ) {
      ball.x = this.params.paddleWidth;
      this.handlePaddleBounce(players.player1.y, true);
    } else if (
      ball.x + this.params.ballSize >= this.params.gameWidth - this.params.paddleWidth &&
      ball.y + this.params.ballSize >= players.player2.y &&
      ball.y <= players.player2.y + this.params.paddleHeight
    ) {
      ball.x = this.params.gameWidth - this.params.paddleWidth - this.params.ballSize;
      this.handlePaddleBounce(players.player2.y, false);
    }
  }

  private handlePaddleBounce(paddleY: number, isLeftPaddle: boolean): void {
    const { ball, players } = this.gameState;
    const maxBounceAngle = Math.PI / 4;
    const relativeIntersectY =
      ball.y + this.params.ballSize / 2 - (paddleY + this.params.paddleHeight / 2);
    const normalizedIntersectY = relativeIntersectY / (this.params.paddleHeight / 2);
    const bounceAngle = normalizedIntersectY * maxBounceAngle;

    this.params.ballSpeedMultiplier = Math.min(
      this.params.ballSpeedMultiplier * this.params.speedIncreaseFactor,
      this.params.maxBallSpeedMultiplier
    );

    const newSpeed = this.params.ballSpeed * this.params.ballSpeedMultiplier;
    const direction = isLeftPaddle ? 1 : -1;
    const paddle = isLeftPaddle ? players.player1 : players.player2;

    if (paddle.dy !== 0) {
      const spinDirection = isLeftPaddle ? -1 : 1;
      const spinChange = paddle.dy * spinDirection * this.params.spinIntensityFactor;
      ball.spin += spinChange;
      if (Math.abs(ball.spin) > this.params.maxSpin) {
        ball.spin = this.params.maxSpin * Math.sign(ball.spin);
      }
    } else {
      ball.spin *= this.params.spinReductionFactor;
      if (Math.abs(ball.spin) < 0.1) ball.spin = 0;
    }

    ball.dx = direction * newSpeed * Math.cos(bounceAngle);
    ball.dy = newSpeed * Math.sin(bounceAngle);
  }

  setGameStatus(status: GameStatus): void {
    this.gameStatus = status;
  }

  pauseGame(): void {
    this.gameStatus = 'paused';
  }

  resumeGame(): void {
    if (this.gameStatus === 'paused') {
      this.gameStatus = 'playing';
    }
  }

  stopGame(): void {
    this.setGameStatus('finished');
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}
