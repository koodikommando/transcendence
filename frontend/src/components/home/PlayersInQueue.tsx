import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import {motion} from 'framer-motion'

import { getUsersInQueue } from '../../services/userService';
import { NavIconButton } from '../UI/buttons/NavIconButton';
import { BackgroundGlow } from '../visual/BackgroundGlow';

interface UsersInQueue {
  display_name: string;
  avatar_url: string;
  user_id: string;
  queue_id: string;
  mode: string;
  variant: string;
}

export const PlayerQueue: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [usersInQueue, setUsersInQueue] = useState<UsersInQueue[]>([]);
  const navigate = useNavigate();

  async function fetchData() {
    setLoading(true);
    const fetchedQueueData = await getUsersInQueue();
    console.log(fetchedQueueData);
    if (fetchedQueueData.queues) {
      console.log('fetched:', fetchedQueueData);
      const enrichedUsers = fetchedQueueData.queues.flatMap((queue) =>
        queue.players.map((player) => ({
          display_name: player.display_name || 'Unknown',
          avatar_url: player.avatar_url || '',
          user_id: player.user_id,
          queue_id: queue.queue_id,
          mode: queue.mode,
          variant: queue.variant,
        }))
      );
      console.log('enriched:', enrichedUsers);
      setUsersInQueue(enrichedUsers);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    console.log('users in queue:', usersInQueue);
  }, [usersInQueue]);

  const handleJoinGameClick = (event, user: UsersInQueue) => {
    event.stopPropagation();
    console.log('join game against: ', user);
    navigate('/game', {
      state: { mode: user.mode, difficulty: user.variant, lobby: 'join', queueId: user.queue_id },
    });
  };

  return (
    <>
          <motion.div className="w-full md:w-1/2">
      <div className="flex items-center justify-center text-center w-full h-[20px] bg-primary text-black text-xs">
        Leaderboard
      </div>
      <motion.div
        className="h-full w-full text-xs relative  text-sm"
        variants={animationVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <BackgroundGlow></BackgroundGlow>
        <ul>
          <h1 className="font-heading text-3xl w-full">Players looking for an opponent</h1>

          {usersInQueue.filter((user) => user.user_id != localStorage.getItem('userID')).length ===
          0 ? (
            <li className="text-muted text-gray-500 text-sm">No players in queue</li>
          ) : (
            usersInQueue
              .filter((user) => user.user_id != localStorage.getItem('userID'))
              .map((user, index) => (
                <li
                  key={index}
                  className="my-2"
                  onClick={() => navigate(`/profile/${user.user_id}`)}
                >
                  <div className="flex items-center gap-5">
                    <div className="rounded-full relative h-[50px] w-[50px] border-2 border-primary overflow-hidden">
                      <img
                        className="object-cover rounded-full w-full h-full"
                        src={user.avatar_url}
                      />
                    </div>
                    <p>{user.display_name || 'N/A'}</p>
                    <p className="text-gray-500 text-sm">rank: ??</p>
                    <NavIconButton
                      id="join-game-button"
                      icon="arrowRight"
                      onClick={(event) => handleJoinGameClick(event, user)}
                    />
                  </div>
                </li>
              ))
          )}
        </ul>
      </div>
      <div className="glass-box mt-5 p-5 w-full relative overflow-hidden">
        <BackgroundGlow></BackgroundGlow>
        <h2 className="font-heading text-3xl">Open Tournaments</h2>
        <p className="text-gray-500 text-sm">No on going Tournaments</p>
      </div>
      </motion.div>
      </motion.div>
    </>
  );
};
