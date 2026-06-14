'use client';
import { useRef, useState } from 'react';
import { FoodOption } from '@/lib/types';

const COLORS = [
  '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF',
  '#FF922B', '#CC5DE8', '#20C997', '#F06595',
  '#74C0FC', '#A9E34B', '#FFA94D', '#DA77F2',
];

interface Props {
  foods: FoodOption[];
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function sectorPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

export default function SpinWheel({ foods }: Props) {
  const wheelRef = useRef<SVGGElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<FoodOption | null>(null);
  const [totalRotation, setTotalRotation] = useState(0);

  const n = foods.length;
  const sectorAngle = 360 / n;
  const cx = 200, cy = 200, r = 185;

  const spin = () => {
    if (spinning) return;
    setResult(null);
    setSpinning(true);

    const selectedIndex = Math.floor(Math.random() * n);
    // Land in the middle of the selected sector, pointer is at top (0°)
    // Sector i starts at i * sectorAngle, we want its middle to point up
    const sectorMid = selectedIndex * sectorAngle + sectorAngle / 2;
    const targetAngle = 360 * 5 + (360 - sectorMid); // 5 full spins + alignment
    const newTotal = totalRotation + targetAngle;
    setTotalRotation(newTotal);

    if (wheelRef.current) {
      wheelRef.current.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 1)';
      wheelRef.current.style.transformOrigin = '200px 200px';
      wheelRef.current.style.transform = `rotate(${newTotal}deg)`;
    }

    setTimeout(() => {
      setSpinning(false);
      setResult(foods[selectedIndex]);
    }, 4100);
  };

  if (n === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-3xl shadow">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-xl font-bold text-gray-600">אין מנות זמינות</p>
        <p className="text-gray-400 mt-2">בקשו מההורה להוסיף מנות לרשימה שלכם</p>
      </div>
    );
  }

  if (n === 1) {
    return (
      <div className="text-center p-8 bg-white rounded-3xl shadow">
        <div className="text-6xl mb-4">{foods[0].emoji}</div>
        <p className="text-2xl font-black text-orange-500">{foods[0].name}</p>
        <p className="text-gray-400 mt-2 text-sm">יש רק מנה אחת - זו הבחירה!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Pointer */}
      <div className="relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 text-3xl drop-shadow-md">▼</div>
        <svg width="400" height="400" viewBox="0 0 400 400" className="drop-shadow-xl max-w-full">
          <g ref={wheelRef}>
            {foods.map((food, i) => {
              const startAngle = i * sectorAngle;
              const endAngle = (i + 1) * sectorAngle;
              const mid = startAngle + sectorAngle / 2;
              const midRad = ((mid - 90) * Math.PI) / 180;
              const textR = r * 0.65;
              const tx = cx + textR * Math.cos(midRad);
              const ty = cy + textR * Math.sin(midRad);
              const color = COLORS[i % COLORS.length];

              return (
                <g key={food.id}>
                  <path d={sectorPath(cx, cy, r, startAngle, endAngle)} fill={color} stroke="white" strokeWidth="2" />
                  <text
                    x={tx}
                    y={ty}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={sectorAngle > 45 ? '22' : sectorAngle > 25 ? '16' : '12'}
                    transform={`rotate(${mid}, ${tx}, ${ty})`}
                  >
                    {food.emoji}
                  </text>
                  {sectorAngle > 30 && (
                    <text
                      x={tx}
                      y={ty + (sectorAngle > 45 ? 22 : 16)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={sectorAngle > 45 ? '9' : '7'}
                      fill="white"
                      fontWeight="bold"
                      transform={`rotate(${mid}, ${tx}, ${ty + (sectorAngle > 45 ? 22 : 16)})`}
                    >
                      {food.name.length > 10 ? food.name.slice(0, 10) + '…' : food.name}
                    </text>
                  )}
                </g>
              );
            })}
            {/* Center circle */}
            <circle cx={cx} cy={cy} r={28} fill="white" stroke="#f97316" strokeWidth="3" />
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="18">🍽️</text>
          </g>
        </svg>
      </div>

      {/* Spin button */}
      <button
        onClick={spin}
        disabled={spinning}
        className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-black text-2xl px-12 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 disabled:cursor-not-allowed"
      >
        {spinning ? '⏳ מסתובב...' : '🎲 סובב!'}
      </button>

      {/* Result */}
      {result && !spinning && (
        <div className="text-center bg-white rounded-3xl shadow-lg p-6 w-full max-w-xs animate-pop">
          <p className="text-gray-500 text-sm mb-2 font-medium">הערב אוכלים:</p>
          <div className="text-6xl mb-3">{result.emoji}</div>
          <p className="text-2xl font-black text-orange-500">{result.name}</p>
          <p className="text-4xl mt-2">🎉</p>
        </div>
      )}
    </div>
  );
}
