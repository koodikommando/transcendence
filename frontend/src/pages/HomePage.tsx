import React, { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { LeaderBoard } from '@components';

import { HomePageNav } from '../components/home/HomePageNav';
import { Tournaments } from '../components/home/Tournaments';
import { Updates } from '../components/home/Updates';

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

export const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('leaderboard');

  return (
    <>
      <motion.div className="w-full relative flex flex-col h-full overflow-hidden  gap-5 md:gap-10 md:p-4">
        <HomePageNav activeTab={activeTab} setActiveTab={setActiveTab}></HomePageNav>
        <motion.div id="home-page-content" className="flex flex-col md:flex-row h-full gap-2">
          {activeTab === 'leaderboard' && (
            <AnimatePresence>
              <motion.div
                key="leaderboard"
                className="md:min-w-1/2 flex justify-center md:justify-end  p-0"
                variants={slideFromLeftVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <LeaderBoard />
              </motion.div>
              <motion.div
                key="playerQueue"
                className="md:min-w-1/2 flex justify-center flex-col gap-10"
                variants={slideFromRightVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                layout
              >
                <Tournaments></Tournaments>
                <Updates></Updates>
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </motion.div>
    </>
  );
};
