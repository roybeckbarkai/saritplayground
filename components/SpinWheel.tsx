'use client';
import { useRef, useState } from 'react';
import { FoodOption } from '@/lib/types';

const COLORS = [
  ['#38BDF8', '#0EA5E9'],
  ['#34D399', '#10B981'],
  ['#FB923C', '#F97316'],
  ['#A78BFA', '#8B5CF6'],
  ['#F472B6', '#EC4899'],
  ['#FBBF24', '#F59E0B'],
  ['#60A5FA', '#3B82F6'],
  ['#4ADE80', '#22C55E'],
  ['#F87171', '#EF4444'],
  ['#C084FC', '#A855F7'],
  ['#2DD4BF', '#14B8A6'],
  ['#E879F9', '#D946EF'],
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

function sectorHighlightPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  // Inner highlight arc for 3D effect
  const rInner = r * 0.55;
  const start = polarToCartesian(cx, cy, rInner, startAngle + 2);
  const end = polarToCartesian(cx, cy, rInner, endAngle - 2);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${rInner} ${rInner} 0 ${largeArc} 1 ${end.x} ${end.y}`;
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
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Pointer */}
      <div className="relative w-full max-w-[340px]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 flex flex-col items-center">
          <div
            className="w-5 h-7 rounded-b-full"
            style={{
              background: 'linear-gradient(180deg, #1e293b 0%, #475569 100%)',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            }}
          />
        </div>

        <svg viewBox="0 0 400 400" className="w-full" style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.18))' }}>
          <defs>
            {COLORS.map(([c1, c2], i) => (
              <radialGradient key={i} id={`grad${i}`} cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor={c1} />
                <stop offset="100%" stopColor={c2} />
              </radialGradient>
            ))}
            {/* Outer ring gradient */}
            <radialGradient id="ringGrad" cx="50%" cy="50%" r="50%">
              <stop offset="85%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </radialGradient>
            {/* Center gradient */}
            <radialGradient id="centerGrad" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </radialGradient>
          </defs>

          {/* Outer decorative ring */}
          <circle cx={cx} cy={cy} r={r + 10} fill="url(#ringGrad)" />

          <g ref={wheelRef}>
            {foods.map((food, i) => {
              const startAngle = i * sectorAngle;
              const endAngle = (i + 1) * sectorAngle;
              const mid = startAngle + sectorAngle / 2;
              const midRad = ((mid - 90) * Math.PI) / 180;
              const textR = r * 0.64;
              const tx = cx + textR * Math.cos(midRad);
              const ty = cy + textR * Math.sin(midRad);
              const colorIdx = i % COLORS.length;

              return (
                <g key={food.id}>
                  {/* Main sector */}
                  <path
                    d={sectorPath(cx, cy, r, startAngle, endAngle)}
                    fill={`url(#grad${colorIdx})`}
                    stroke="white"
                    strokeWidth="2"
                  />
                  {/* Inner highlight for 3D depth */}
                  <path
                    d={sectorHighlightPath(cx, cy, r, startAngle, endAngle)}
                    fill="none"
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {/* Emoji only */}
                  <text
                    x={tx}
                    y={ty}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={sectorAngle > 40 ? '28' : sectorAngle > 22 ? '22' : '16'}
                    transform={`rotate(${mid}, ${tx}, ${ty})`}
                    style={{ userSelect: 'none' }}
                  >
                    {food.emoji}
                  </text>
                </g>
              );
            })}

            {/* Center button */}
            <circle cx={cx} cy={cy} r={32} fill="url(#centerGrad)" stroke="white" strokeWidth="3" />
            <circle cx={cx} cy={cy} r={28} fill="none" stroke="#e2e8f0" strokeWidth="1" />
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="20" style={{ userSelect: 'none' }}>🎡</text>
          </g>

          {/* Gloss overlay */}
          <ellipse
            cx={cx}
            cy={cy - 60}
            rx={r * 0.75}
            ry={r * 0.35}
            fill="rgba(255,255,255,0.07)"
            style={{ pointerEvents: 'none' }}
          />
        </svg>
      </div>

      {/* Spin button */}
      <button
        onClick={spin}
        disabled={spinning}
        className="bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xl px-12 py-4 rounded-full transition-all duration-200 active:scale-95 shadow-md"
        style={{ letterSpacing: '-0.01em' }}
      >
        {spinning ? '⏳ מסתובב...' : 'יאללה לסובב!'}
      </button>

      {/* Result */}
      {result && !spinning && (
        <div className="text-center bg-white rounded-3xl border border-slate-100 shadow-sm p-7 w-full animate-pop">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">הערב אוכלים</p>
          <p className="text-6xl mb-3">{result.emoji}</p>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">{result.name}</p>
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
