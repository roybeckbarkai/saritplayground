'use client';
import { useState } from 'react';

interface Props {
  emoji?: string;
  size?: number;
}

export default function AnimatedPlate({ emoji = '🍽️', size = 80 }: Props) {
  const [wobble, setWobble] = useState(false);

  const trigger = () => {
    setWobble(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setWobble(true));
    });
    setTimeout(() => setWobble(false), 500);
  };

  return (
    <div
      className="inline-flex items-center justify-center cursor-pointer select-none animate-float"
      style={{ fontSize: size }}
      onClick={trigger}
    >
      <span className={wobble ? 'animate-wobble' : ''} style={{ display: 'inline-block' }}>
        {emoji}
      </span>
    </div>
  );
}
