'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getChildren } from '@/lib/storage';
import { Child } from '@/lib/types';
import SpinWheel from '@/components/SpinWheel';
import Link from 'next/link';

export default function SpinPage() {
  const router = useRouter();
  const [child, setChild] = useState<Child | null>(null);

  useEffect(() => {
    const childId = sessionStorage.getItem('currentChildId');
    if (!childId) { router.push('/child/login'); return; }
    const found = getChildren().find(c => c.id === childId);
    if (!found) { router.push('/child/login'); return; }
    setChild(found);
  }, [router]);

  if (!child) return null;

  const activeFoods = child.foodOptions.filter(f => f.isActive);

  return (
    <main className="min-h-screen flex flex-col items-center bg-white">
      {/* Header */}
      <div className="w-full px-5 pt-12 pb-2 flex items-center justify-between max-w-lg mx-auto">
        <Link href="/child/login" className="text-slate-400 text-sm">→ חזרה</Link>
        <p className="font-semibold text-slate-900">{child.name}</p>
        <div className="w-12" />
      </div>

      <div className="w-full max-w-lg px-4 pt-2 pb-8 flex flex-col items-center gap-3">
        <p className="text-lg font-bold text-slate-700 text-center">תנו למזל לבחור מה לאכול</p>
        <SpinWheel foods={activeFoods} />
      </div>
    </main>
  );
}
