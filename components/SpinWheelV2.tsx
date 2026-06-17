'use client';
import { useRef, useState } from 'react';
import { FoodOption } from '@/lib/types';

// Muted, sophisticated palette - dusty & warm
const PALETTE = [
  { base: '#C47B5A', light: '#D9A080', dark: '#A05A3A' }, // terracotta
  { base: '#7A9E7E', light: '#9CC4A0', dark: '#5A7E5E' }, // sage
  { base: '#8B9EC7', light: '#AABDE0', dark: '#6B7EA7' }, // dusty blue
  { base: '#C4A87A', light: '#DEC89A', dark: '#A4885A' }, // warm sand
  { base: '#A87A9E', light: '#C89ABE', dark: '#885A7E' }, // dusty mauve
  { base: '#7AAEC4', light: '#9ACEDE', dark: '#5A8EA4' }, // steel blue
  { base: '#C4C47A', light: '#DEDE9A', dark: '#A4A45A' }, // olive
  { base: '#C47A7A', light: '#DE9A9A', dark: '#A45A5A' }, // rose
  { base: '#7ABEC4', light: '#9ADEDE', dark: '#5A9EA4' }, // teal
  { base: '#B4A07A', light: '#CEC09A', dark: '#94805A' }, // tan
  { base: '#9A7AC4', light: '#BA9ADE', dark: '#7A5AA4' }, // violet
  { base: '#7AC4A0', light: '#9ADEC0', dark: '#5AA480' }, // mint
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

export default function SpinWheelV2({ foods }: Props) {
  const wheelRef = useRef<SVGGElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<FoodOption | null>(null);
  const [totalRotation, setTotalRotation] = useState(0);

  const n = foods.length;
  const cx = 210, cy = 210, r = 180;
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
      wheelRef.current.style.transformOrigin = `${cx}px ${cy}px`;
      wheelRef.current.style.transform = `rotate(${newTotal}deg)`;
    }
    setTimeout(() => { setSpinning(false); setResult(foods[selectedIndex]); }, 4100);
  };

  if (n === 0) {
    return (
      <div className="text-center p-10 bg-stone-50 rounded-3xl">
        <p className="text-4xl mb-3">😕</p>
        <p className="font-semibold text-stone-600">אין מנות זמינות</p>
      </div>
    );
  }

  if (n === 1) {
    return (
      <div className="text-center p-10 bg-stone-50 rounded-3xl">
        <p className="text-5xl mb-3">{foods[0].emoji}</p>
        <p className="font-semibold text-stone-800 text-xl">{foods[0].name}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-7 w-full">
      <div className="relative w-full max-w-[360px]">
        {/* Pointer */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 z-10" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.25))' }}>
          <svg width="24" height="32" viewBox="0 0 24 32">
            <defs>
              <linearGradient id="pointerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6B6B6B" />
                <stop offset="50%" stopColor="#EFEFEF" />
                <stop offset="100%" stopColor="#8B8B8B" />
              </linearGradient>
            </defs>
            <path d="M12 2 L22 28 Q12 22 2 28 Z" fill="url(#pointerGrad)" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
        </div>

        <svg viewBox="0 0 420 420" className="w-full" style={{ filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.22)) drop-shadow(0 4px 8px rgba(0,0,0,0.12))' }}>
          <defs>
            {foods.map((_, i) => {
              const p = PALETTE[i % PALETTE.length];
              return (
                <radialGradient key={i} id={`vg${i}`} cx="38%" cy="32%" r="75%">
                  <stop offset="0%" stopColor={p.light} />
                  <stop offset="60%" stopColor={p.base} />
                  <stop offset="100%" stopColor={p.dark} />
                </radialGradient>
              );
            })}
            {/* Outer rim gradient - metallic feel */}
            <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5F0E8" />
              <stop offset="30%" stopColor="#E8E0D0" />
              <stop offset="70%" stopColor="#C8C0B0" />
              <stop offset="100%" stopColor="#F0EAE0" />
            </linearGradient>
            {/* Center hub */}
            <radialGradient id="hubGrad" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#F0EDE8" />
              <stop offset="100%" stopColor="#D8D2C8" />
            </radialGradient>
            {/* Gloss */}
            <radialGradient id="gloss" cx="50%" cy="20%" r="60%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
            {/* Inner shadow ring */}
            <radialGradient id="innerShadow" cx="50%" cy="50%" r="50%">
              <stop offset="88%" stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.12)" />
            </radialGradient>
          </defs>

          {/* Outer rim */}
          <circle cx={cx} cy={cy} r={r + 18} fill="url(#rimGrad)" />
          <circle cx={cx} cy={cy} r={r + 14} fill="rgba(255,255,255,0.5)" />
          <circle cx={cx} cy={cy} r={r + 11} fill="rgba(0,0,0,0.06)" />

          <g ref={wheelRef}>
            {/* Sectors */}
            {foods.map((food, i) => {
              const startAngle = i * sectorAngle;
              const endAngle = (i + 1) * sectorAngle;
              const mid = startAngle + sectorAngle / 2;
              const midRad = ((mid - 90) * Math.PI) / 180;
              const textR = r * 0.62;
              const tx = cx + textR * Math.cos(midRad);
              const ty = cy + textR * Math.sin(midRad);

              // Edge highlight (lighter arc near rim)
              const hiR = r - 6;
              const hiStart = polarToCartesian(cx, cy, hiR, startAngle + 1.5);
              const hiEnd = polarToCartesian(cx, cy, hiR, endAngle - 1.5);
              const largeArc = endAngle - startAngle > 180 ? 1 : 0;

              return (
                <g key={food.id}>
                  <path
                    d={sectorPath(cx, cy, r, startAngle, endAngle)}
                    fill={`url(#vg${i})`}
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="1.5"
                  />
                  {/* Subtle highlight near outer edge */}
                  <path
                    d={`M ${hiStart.x} ${hiStart.y} A ${hiR} ${hiR} 0 ${largeArc} 1 ${hiEnd.x} ${hiEnd.y}`}
                    fill="none"
                    stroke="rgba(255,255,255,0.28)"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  {/* Emoji */}
                  <text
                    x={tx} y={ty}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={sectorAngle > 40 ? '30' : sectorAngle > 22 ? '22' : '16'}
                    transform={`rotate(${mid}, ${tx}, ${ty})`}
                    style={{ userSelect: 'none' }}
                  >{food.emoji}</text>
                </g>
              );
            })}

            {/* Inner shadow overlay */}
            <circle cx={cx} cy={cy} r={r} fill="url(#innerShadow)" style={{ pointerEvents: 'none' }} />

            {/* Gloss overlay */}
            <ellipse cx={cx - 30} cy={cy - 55} rx={r * 0.65} ry={r * 0.38} fill="url(#gloss)" style={{ pointerEvents: 'none' }} />

            {/* Center hub */}
            <circle cx={cx} cy={cy} r={36} fill="rgba(0,0,0,0.12)" transform="translate(0, 2)" />
            <circle cx={cx} cy={cy} r={36} fill="url(#hubGrad)" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" />
            <circle cx={cx} cy={cy} r={30} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="22" style={{ userSelect: 'none' }}>🎡</text>
          </g>
        </svg>
      </div>

      {/* Spin button */}
      <button
        onClick={spin}
        disabled={spinning}
        className="bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xl px-14 py-4 rounded-full transition-all duration-200 active:scale-95 shadow-md"
      >
        {spinning ? '⏳ מסתובב...' : 'יאללה לסובב!'}
      </button>

      {/* Result */}
      {result && !spinning && (
        <div className="text-center bg-white rounded-3xl border border-stone-100 shadow-sm p-7 w-full animate-pop">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">הערב אוכלים</p>
          <p className="text-6xl mb-3">{result.emoji}</p>
          <p className="text-2xl font-bold text-stone-900 tracking-tight">{result.name}</p>
          <button onClick={spin} className="mt-5 text-sky-500 text-sm font-medium hover:text-sky-600 transition-colors">
            סובב שוב
          </button>
        </div>
      )}
    </div>
  );
}
