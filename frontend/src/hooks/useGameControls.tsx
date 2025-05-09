import { useEffect, useRef, useState } from 'react';

import { useGameOptionsContext, useUser, useWebSocketContext } from '@contexts';

import { createMoveInputMessage } from '@shared/messages';

export const useGameControls = () => {
  const [keysPressed, setKeysPressed] = useState<Record<string, boolean>>({});
  const [localPlayerId, setLocalPlayerId] = useState<string | null>(null);
  const [remotePlayerId, setRemotePlayerId] = useState<string | null>(null);
  const { sendMessage } = useWebSocketContext();
  const { difficulty } = useGameOptionsContext();
  const { userId } = useUser();

  // Only track whether movement was null previously
  const wasLocalMovingRef = useRef<boolean>(false);
  const wasRemoteMovingRef = useRef<boolean>(false);

  useEffect(() => {
    if (difficulty === 'local') {
      setLocalPlayerId(userId);
      setRemotePlayerId('player2');
    } else {
      setLocalPlayerId(userId);
      setRemotePlayerId(userId);
    }
  }, [difficulty, userId, setLocalPlayerId, setRemotePlayerId]);

  useEffect(() => {
    if (!localPlayerId || !remotePlayerId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default actions during gameplay
      if (['w', 's', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
      }

      setKeysPressed((prev) => {
        if (!prev[e.key]) {
          // If key wasn't already pressed
          return { ...prev, [e.key]: true };
        }
        return prev;
      });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeysPressed((prev) => ({ ...prev, [e.key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [localPlayerId, remotePlayerId]);

  // Control loop with fixed interval timer
  useEffect(() => {
    if (!localPlayerId || !remotePlayerId) return;

    const intervalId = setInterval(() => {
      // Determine current movement states
      let localMovement: 'up' | 'down' | null = null;
      let remoteMovement: 'up' | 'down' | null = null;
      let isLocalMoving = false;
      let isRemoteMoving = false;

      // Local player movement
      if (keysPressed['w']) {
        localMovement = 'up';
        isLocalMoving = true;
      } else if (keysPressed['s']) {
        localMovement = 'down';
        isLocalMoving = true;
      }

      // Remote player movement
      if (keysPressed['ArrowUp']) {
        remoteMovement = 'up';
        isRemoteMoving = true;
      } else if (keysPressed['ArrowDown']) {
        remoteMovement = 'down';
        isRemoteMoving = true;
      }

      if (isLocalMoving) {
        sendMessage('game', createMoveInputMessage(localPlayerId, localMovement));
        wasLocalMovingRef.current = true;
      } else if (wasLocalMovingRef.current) {
        sendMessage('game', createMoveInputMessage(localPlayerId, null));
        wasLocalMovingRef.current = false;
      }

      if (isRemoteMoving) {
        sendMessage('game', createMoveInputMessage(remotePlayerId, remoteMovement));
        wasRemoteMovingRef.current = true;
      } else if (wasRemoteMovingRef.current) {
        sendMessage('game', createMoveInputMessage(remotePlayerId, null));
        wasRemoteMovingRef.current = false;
      }
    }, 1000 / 60); // 60fps

    return () => {
      clearInterval(intervalId);
    };
  }, [keysPressed, sendMessage, localPlayerId, remotePlayerId]);

  return localPlayerId;
};
