import React, { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { useGameOptionsContext, useUser } from '@contexts';

import { ClippedButton } from '@components/UI';
import { WinnerSvg } from '@components/visual';

interface PlayerData {
  user_id: string;
  avatar_url: string;
  display_name: string;
}

interface GameResultsProps {
  result: {
    game_id: string;
    winner_id: string;
    loser_id: string;
    winner_score: number;
    loser_score: number;
  };
  playersData: {
    player1: PlayerData | null;
    player2: PlayerData | null;
  };
}

const aiOptions: Record<string, { avatar: string; name: string }> = {
  easy: {
    avatar: '/images/avatars/ai_easy.png',
    name: 'AI_EASY',
  },
  normal: {
    avatar: '/images/avatars/ai.png',
    name: 'AI_NORMAL',
  },
  brutal: {
    avatar: '/images/avatars/ai_hard.png',
    name: 'AI_BRUTAL',
  },
};

export const GameResults: React.FC<GameResultsProps> = ({ result, playersData }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { mode } = useGameOptionsContext();
  const [winner, setWinner] = React.useState<PlayerData | null>(null);
  const [loser, setLoser] = React.useState<PlayerData | null>(null);

  const handleContinueClick = () => {
    if (mode === 'tournament') {
      navigate('/tournamentLobby');
    } else {
      navigate('/gameMenu');
    }
  };

  const isAI = (id: string) => id in aiOptions;

  const getPlayer = (id: string): PlayerData | null => {
    if (playersData.player1?.user_id === id) return playersData.player1;
    if (playersData.player2?.user_id === id) return playersData.player2;
    if (isAI(id)) {
      const ai = aiOptions[id];
      return {
        user_id: id,
        display_name: ai.name,
        avatar_url: ai.avatar,
      };
    }
    return null;
  };

  useEffect(() => {
    setWinner(getPlayer(result.winner_id));
    setLoser(getPlayer(result.loser_id));
  }, [result, playersData]);

  return (
    <div className="p-2 flex flex-col w-full relative justify-center items-center gap-5 ">
      <h1 className="font-heading text-5xl">
        {user?.user_id === winner?.user_id ? 'You Win!' : 'You lose!'}
      </h1>

      {winner && loser && (
        <div className="relative  h-82 w-82">
          <div className="w-full font-heading text-2xl justify-around flex gap-2">
            <h2>
              {winner?.display_name || 'Unknown'}: {result.winner_score}
            </h2>
            <h2>
              {loser?.display_name || 'Unknown'}: {result.loser_score}
            </h2>
          </div>
          <div className="absolute top-0 w-full h-auto grid grid-rows-1 grid-cols-1 items-center">
            <div className="row-start-1 col-start-1 ">
              <WinnerSvg></WinnerSvg>
            </div>
            <div className="text-center  row-start-1 col-start-1 flex flex-col justify-center items-center">
              <h1 className="font-heading text-3xl">Winner</h1>
              <img
                src={winner.avatar_url}
                alt={`${winner.display_name}'s avatar`}
                className="w-24 h-24 glass-box"
              />
              <span className="mt-2">{winner.display_name}</span>
            </div>
          </div>
        </div>
      )}

      <ClippedButton label="continue" onClick={handleContinueClick} />
    </div>
  );
};
