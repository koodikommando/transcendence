import React, { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';

import { AnimatePresence, motion } from 'framer-motion';

import { Friends, MatchHistory, ProfileHeader } from '@components/profile';
import { Error } from '@components/UI';

import { getUserData } from '@services';

import { UserDataResponseType } from '@shared/types';

// const animationVariants = {
//   initial: {
//     clipPath: 'inset(0 100% 0 0)',
//     opacity: 0,
//   },
//   animate: {
//     clipPath: 'inset(0 0% 0 0)',
//     opacity: 1,
//     transition: { duration: 0.4, ease: 'easeInOut', delay: 0.3 },
//   },
//   exit: {
//     clipPath: 'inset(0 100% 0 0)',
//     opacity: 0,
//     transition: { duration: 0.4, ease: 'easeInOut' },
//   },
// };

export const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserDataResponseType | null>(null);
  const [loading, setLoading] = useState(false);

  const { userId } = useParams<{ userId: string }>();

  useEffect(() => {
    setLoading(true);
    if (!userId) return;

    getUserData(userId)
      .then((data) => {
        setUser(data);
      })
      .catch((error) => {
        console.error('Failed to fetch user data: ', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center  text-lg">
        <div>
          <p>loading..</p>
        </div>
      </div>
    );
  }

  if (!user && !loading) {
    return (
      <Error>
        <div className="text-center mt-10 text-lg text-red-500">Failed to load user data.</div>
      </Error>
    );
  }

  return (
    <motion.div className="w-full h-full flex flex-col items-center justify-start relative">
      <AnimatePresence>
        <>
          <div className="p-2 gap-2 md:gap-4 grid w-full grid-cols-1 md:grid-cols-2">
            <div className="row-start-1  col-start-1 self-start flex-none">
              <ProfileHeader user={user}></ProfileHeader>
            </div>

            <motion.div className="my-2 col-start-1 row-start-2 md:row-start-1 md:col-start-2 md:row-span-2 flex-none">
              <Friends user={user} />
            </motion.div>
            <motion.div
              key="match history"
              className="my-2 justify-start col-start-1  row-start-3 md:row-start-2 md:col-start-1 gap-3  w-full h-full"
            >
              <motion.div className="w-full my-2">
                <MatchHistory user={user} />
              </motion.div>
            </motion.div>
          </div>
        </>
      </AnimatePresence>
    </motion.div>
  );
};
