import React, { useEffect } from 'react';

import { BoxDiv } from '../visual/svg/containers/SvgBoxContainer';
import { PaddleBiggerIcon } from '../visual/svg/icons/PaddleBiggerIcon';
import { PaddleFasterIcon } from '../visual/svg/icons/PaddleFasterIcont';
import { PaddleSlowerIcon } from '../visual/svg/icons/PaddleSlowerIcon';
import { PaddleSmallerIcon } from '../visual/svg/icons/PaddleSmallerIcon';
import { SpinPowerUp } from '../visual/svg/icons/SpinPowerUp';

const powerUps = [
  'Paddle Slower',
  'Paddle Smaller',
  'Paddle Bigger',
  'Paddle Faster',
  'Extra Spin',
];

const powerUpIcons: Record<string, React.ReactNode> = {
  'Paddle Slower': <PaddleSlowerIcon />,
  'Paddle Faster': <PaddleFasterIcon />,
  'Paddle Bigger': <PaddleBiggerIcon />,
  'Paddle Smaller': <PaddleSmallerIcon />,
  'Extra Spin': <SpinPowerUp />,
};

type PowerUpSelectionProps = {
  isEnabled: boolean;
  isSpinEnabled: boolean;
  setIsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  selectedPowerUps: string[];
  setSelectedPowerUps: React.Dispatch<React.SetStateAction<string[]>>;
};

export const PowerUpSelection: React.FC<PowerUpSelectionProps> = ({
  isEnabled,
  setIsEnabled,
  selectedPowerUps,
  setSelectedPowerUps,
  isSpinEnabled,
}) => {
  const handlePowerUpToggle = (powerUp: string) => {
    if (!isEnabled || (powerUp === 'Extra Spin' && !isSpinEnabled)) return;

    console.log(selectedPowerUps);
    setSelectedPowerUps((prev) =>
      prev.includes(powerUp) ? prev.filter((p) => p !== powerUp) : [...prev, powerUp]
    );
  };

  useEffect(() => {
    if (isEnabled) {
      setSelectedPowerUps((prev) => {
        // Only populate if empty
        if (prev.length === 0) {
          return powerUps;
        }
        return prev;
      });
    } else {
      setSelectedPowerUps([]);
    }
  }, []);

  const handleEnableToggle = () => {
    setIsEnabled((prev) => {
      const newEnabled = !prev;
      if (!newEnabled) {
        setSelectedPowerUps([]); // Clear all power-ups if disabling
      }
      return newEnabled;
    });
  };

  return (
    <>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
        {powerUps.map((powerUp, index) => (
          <span
            key={powerUp}
            onClick={() => handlePowerUpToggle(powerUp)}
            className={`aspect-square text-center cursor-pointer ${selectedPowerUps.includes(powerUp) && isEnabled ? 'text-secondary' : !selectedPowerUps.includes(powerUp) && isEnabled ? 'hover:opacity-100 opacity-60' : !isEnabled ? 'text-gray-400/60' : ''} `}
          >
            <BoxDiv index={index} key={powerUp}>
              <div
                className={`aspect-square max-w-full max-h-full p-3 flex flex-col gap-2 text-center cursor-pointer ${selectedPowerUps.includes(powerUp) && isEnabled ? 'text-primary' : 'text-grey-500 opacity-60'}`}
              >
                <div className="">{powerUpIcons[powerUp] || <PaddleSlowerIcon />}</div>
              </div>
            </BoxDiv>
            <span className="text-secondary text-[10px]">{powerUp}</span>
          </span>
        ))}
      </div>
    </>
  );
};
