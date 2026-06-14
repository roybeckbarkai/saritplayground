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
    <main className="min-h-screen flex flex-col items-center p-4 bg-gradient-to-b from-amber-50 to-orange-100">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between mb-4 pt-2">
          <Link href="/child/login" className="text-orange-400 text-sm">→ חזרה</Link>
          <div className="text-center">
            <h1 className="text-2xl font-black text-orange-500">{child.name}</h1>
            <p className="text-gray-400 text-xs">{activeFoods.length} מנות אפשריות</p>
          </div>
          <div className="w-12" />
        </div>

        <SpinWheel foods={activeFoods} />
      </div>
    </main>
  );
}
