import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { AnimatePresence, motion } from 'framer-motion';

import { ChatWindow } from '../components/chat/ChatWindow';
import { GameOptions } from '../components/gameOptions/GameOptions';
import TournamentBracket from '../components/tournament/TournamentBracket';
import { ListSvgContainer } from '../components/visual/svg/containers/ListSvgContainer';
import { useChatContext } from '../contexts/chatContext/ChatContext';
import { useGameOptionsContext } from '../contexts/gameContext/GameOptionsContext';
import { useUser } from '../contexts/user/UserContext';

export const slideFromLeftVariants = {
  initial: {
    x: '-100%',
    scale: 1.05,
  },
  animate: {
    x: 0,
    scale: 1,
    transition: {
      x: { duration: 0.4, ease: 'easeInOut' },
      scale: { delay: 0.4, duration: 0.2, ease: 'easeInOut' },
    },
  },
  exit: {
    x: '-100%',
    scale: 1.05,
    opacity: 1,
    transition: {
      scale: { duration: 0.2, ease: 'easeOut' },
      x: { delay: 0.2, duration: 0.4, ease: 'easeInOut' },
    },
  },
};

export const slideFromRightVariants = {
  initial: {
    x: '100%',
    scale: 1.05,
  },
  animate: {
    x: 0,
    scale: 1,
    transition: {
      x: { duration: 0.4, ease: 'easeInOut' },
      scale: { delay: 0.4, duration: 0.2, ease: 'easeInOut' },
    },
  },
  exit: {
    x: '100%',
    scale: 1.05,
    opacity: 1,
    transition: {
      scale: { duration: 0.2, ease: 'easeOut' },
      x: { delay: 0.2, duration: 0.4, ease: 'easeInOut' },
    },
  },
};

export const TournamentLobbyNav: React.FC<{
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}> = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const { setLobby, setDifficulty, setMode, resetGameOptions } = useGameOptionsContext();

  useEffect(() => {
    resetGameOptions();
  }, []);

  return (
    <motion.div
      id="home-page-nav"
      className="flex relative overflow-hidden p-0 items-center text-lg gap-3 md:gap-6"
      layout
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <span className="relative p-0 flex gap-4">
        <button
          className={`btn btn-primary ${activeTab === 'settings' ? ' text-secondary' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>

        <button onClick={() => setActiveTab('players')}>
          <span className={`${activeTab === 'players' ? ' text-secondary' : ''}`}>Players</span>
        </button>

        <button onClick={() => setActiveTab('matches')}>
          <span className={`${activeTab === 'matches' ? ' text-secondary' : ''}`}>Matches</span>
        </button>
      </span>
    </motion.div>
  );
};

export const TournamentSettings: React.FC = () => {
  const [enablePowerUps, setEnablePowerUps] = useState(false);
  const [selectedPowerUps, setSelectedPowerUps] = useState<string[]>([]);
  return <GameOptions></GameOptions>;
};

export const TournamentPlayerList: React.FC = () => {
  const [enablePowerUps, setEnablePowerUps] = useState(false);
  const [selectedPowerUps, setSelectedPowerUps] = useState<string[]>([]);
  return (
    <div className="h-full w-full">
      <motion.ul className="p-2 w-full h-full flex flex-col justify-items-start gap-2overflow-y-scroll">
        <motion.li
          className="h-[57px] min-w-[282px] flex gap-3 hover:scale-[1.02] p-1 hover:text-secondary"
          // onClick={() => navigate(`/profile/${user.user_id}`)}
        >
          <ListSvgContainer>
            <div className="flex items-center gap-2">
              <div className="opacity relative h-[50px] w-[50px] border-1 border-current overflow-hidden">
                <img
                  className="object-cover w-full h-full"
                  src={'./src/assets/images/default_avatar.png'}
                  alt={`users's profile picture`}
                />
              </div>
              <p className="text-xs">
                dummy user <br />
              </p>
            </div>
          </ListSvgContainer>
        </motion.li>
      </motion.ul>
    </div>
  );
};

export const TournamentMatchList: React.FC = ({ players }) => {
  const [activeTab, setActiveTab] = useState('bracket');

  return (
    <motion.div>
      <div className="flex gap-3">
        <button className="text-xs" onClick={() => setActiveTab('bracket')}>
          bracket
        </button>
        <button className="text-xs" onClick={() => setActiveTab('list')}>
          list
        </button>
      </div>
      <motion.div
        key="tournamentBracket"
        className="w-full h-full  border-1 border-primary bg-black/30"
        variants={slideFromRightVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {activeTab == 'bracket' ? (
          <TournamentBracket players={players}></TournamentBracket>
        ) : (
          <>
            <h1>not implemented :)</h1>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export const TournamentLobby: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('settings');
  const { user } = useUser();
  const { friends, selectedFriendId, roomId } = useChatContext();
  const [players, setPlayers] = useState<any[]>();
  const [tournamentChatId, setTournamentChatId] = useState<string | undefined>();

  const { createRoom } = useChatContext();

  // useEffect(() => {
  //   setPlayers([user?.user_id]);
  // }, [user]);

  useEffect(() => {
    if (!user) return;

    const setupChat = async () => {
      console.log('TOURNAMENT LOBBY SET UP CHAT: Players: ', null);
      const chatId = await createRoom(
        'tournamentChat_' + Math.floor(Math.random() * 50),
        true,
        null
      );
      if (chatId) {
        setTournamentChatId(chatId);
      }
    };

    setupChat();
  }, [user]);

  useEffect(() => {}, [tournamentChatId]);

  useEffect(() => {
    setPlayers(Array.from({ length: 8 }, (_, i) => `Competitor ${i + 1}`));
  }, []);

  console.log(selectedFriendId);

  return (
    <>
      <motion.div className="w-full h-full flex flex-col justify-between relative z-10 gap-5">
        <header className="flex w-full justify-between">
          <TournamentLobbyNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          ></TournamentLobbyNav>
          <span className="text-secondary">X/X Players</span>
        </header>

        <div className="flex flex-col md:flex-col gap-2 w-full h-full flex-grow">
          <motion.div className="flex flex-col md:w-full h-full w-full gap-2 md:gap-10">
            <AnimatePresence mode="wait">
              {activeTab === 'settings' ? (
                <motion.div
                  key="tournamentSettings"
                  className="w-full h-full"
                  variants={slideFromLeftVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <TournamentSettings></TournamentSettings>
                </motion.div>
              ) : activeTab == 'matches' ? (
                <TournamentMatchList players={players}></TournamentMatchList>
              ) : (
                <motion.div
                  key="tournamentPlayerList"
                  className="w-full h-full"
                  variants={slideFromRightVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <TournamentPlayerList></TournamentPlayerList>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <div className="@container glass-box h-[200px] w-full">
            <p>chat</p>
            {user && tournamentChatId && (
              <ChatWindow
                selectedFriendId={selectedFriendId}
                friends={friends}
                roomId={tournamentChatId}
              ></ChatWindow>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};
