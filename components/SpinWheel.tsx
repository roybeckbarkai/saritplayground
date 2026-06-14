'use client';
import { useRef, useState } from 'react';
import { FoodOption } from '@/lib/types';

// Teal-to-blue palette, clean and Apple-ish
const COLORS = [
  '#0EA5E9', '#38BDF8', '#0284C7', '#7DD3FC',
  '#0369A1', '#BAE6FD', '#075985', '#E0F2FE',
  '#0891B2', '#67E8F9', '#0E7490', '#A5F3FC',
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
  const cx = 200, cy = 200, r = 185;
  const sectorAngle = n > 0 ? 360 / n : 360;

  const spin = () => {
    if (spinning || n < 2) return;
    setResult(null);
    setSpinning(true);

    const selectedIndex = Math.floor(Math.random() * n);
    const sectorMid = selectedIndex * sectorAngle + sectorAngle / 2;
    const targetAngle = 360 * 6 + (360 - sectorMid);
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
      <div className="text-center p-10 bg-gray-50 rounded-3xl border border-slate-200">
        <p className="text-4xl mb-3">😕</p>
        <p className="font-semibold text-slate-700">אין מנות זמינות</p>
        <p className="text-slate-400 text-sm mt-1">בקשו מההורה להוסיף מנות</p>
      </div>
    );
  }

  if (n === 1) {
    return (
      <div className="text-center p-10 bg-gray-50 rounded-3xl border border-slate-200">
        <p className="text-5xl mb-3">{foods[0].emoji}</p>
        <p className="font-semibold text-slate-900 text-xl">{foods[0].name}</p>
        <p className="text-slate-400 text-sm mt-1">מנה יחידה — זו ההחלטה!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      {/* Wheel */}
      <div className="relative w-full max-w-[400px]">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
          <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[20px] border-l-transparent border-r-transparent border-t-slate-800" />
        </div>

        <svg viewBox="0 0 400 400" className="w-full drop-shadow-md">
          {/* Outer ring */}
          <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke="#E2E8F0" strokeWidth="2" />

          <g ref={wheelRef}>
            {foods.map((food, i) => {
              const startAngle = i * sectorAngle;
              const endAngle = (i + 1) * sectorAngle;
              const mid = startAngle + sectorAngle / 2;
              const midRad = ((mid - 90) * Math.PI) / 180;
              const textR = r * 0.62;
              const tx = cx + textR * Math.cos(midRad);
              const ty = cy + textR * Math.sin(midRad);
              const color = COLORS[i % COLORS.length];

              return (
                <g key={food.id}>
                  <path
                    d={sectorPath(cx, cy, r, startAngle, endAngle)}
                    fill={color}
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  <text
                    x={tx}
                    y={ty}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={sectorAngle > 45 ? '24' : sectorAngle > 25 ? '18' : '13'}
                    transform={`rotate(${mid}, ${tx}, ${ty})`}
                  >
                    {food.emoji}
                  </text>
                  {sectorAngle >= 28 && (
                    <text
                      x={tx}
                      y={ty + (sectorAngle > 45 ? 22 : 16)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={sectorAngle > 45 ? '9' : '7'}
                      fill="rgba(255,255,255,0.9)"
                      fontWeight="600"
                      transform={`rotate(${mid}, ${tx}, ${ty + (sectorAngle > 45 ? 22 : 16)})`}
                    >
                      {food.name.length > 9 ? food.name.slice(0, 9) + '…' : food.name}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Center */}
            <circle cx={cx} cy={cy} r={26} fill="white" stroke="#E2E8F0" strokeWidth="2" />
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="16">🎡</text>
          </g>
        </svg>
      </div>

      {/* Button */}
      <button
        onClick={spin}
        disabled={spinning}
        className="bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium text-xl px-14 py-4 rounded-full transition-all duration-200 active:scale-95 shadow-sm"
      >
        {spinning ? 'מסתובב...' : 'סובב'}
      </button>

      {/* Result */}
      {result && !spinning && (
        <div className="text-center bg-gray-50 rounded-3xl border border-slate-200 p-8 w-full animate-pop">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">הערב אוכלים</p>
          <p className="text-6xl mb-3">{result.emoji}</p>
          <p className="text-2xl font-semibold text-slate-900 tracking-tight">{result.name}</p>
          <button
            onClick={spin}
            className="mt-5 text-sky-500 text-sm font-medium hover:text-sky-600 transition-colors"
          >
            סובב שוב
          </button>
        </div>
      )}
    </div>
  );
}
