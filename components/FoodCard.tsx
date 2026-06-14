'use client';
import { useState } from 'react';
import { MasterDish } from '@/lib/types';

interface Props {
  dish: MasterDish;
  selected: boolean;
  onToggle: (dish: MasterDish) => void;
}

export default function FoodCard({ dish, selected, onToggle }: Props) {
  const [pop, setPop] = useState(false);

  const handleClick = () => {
    setPop(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setPop(true)));
    setTimeout(() => setPop(false), 300);
    onToggle(dish);
  };

  return (
    <button
      onClick={handleClick}
      className={`
        flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all duration-200 min-w-[90px]
        ${selected
          ? 'border-orange-400 bg-orange-100 shadow-md shadow-orange-200'
          : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50'
        }
      `}
    >
      <span className={`text-3xl ${pop ? 'animate-pop' : ''}`} style={{ display: 'inline-block' }}>
        {dish.emoji}
      </span>
      <span className={`text-xs font-medium text-center leading-tight ${selected ? 'text-orange-700' : 'text-gray-600'}`}>
        {dish.name}
      </span>
      {selected && (
        <span className="text-orange-500 text-sm font-bold">✓</span>
      )}
    </button>
  );
}
