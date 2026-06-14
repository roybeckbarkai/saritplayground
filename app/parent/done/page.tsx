'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getFamilies, getChildrenByFamily } from '@/lib/storage';
import { Child, Family } from '@/lib/types';
import Link from 'next/link';

export default function ParentDonePage() {
  const router = useRouter();
  const [family, setFamily] = useState<Family | null>(null);
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => {
    const familyId = sessionStorage.getItem('currentFamilyId');
    if (!familyId) { router.push('/parent/register'); return; }
    const f = getFamilies().find(x => x.id === familyId);
    if (!f) { router.push('/parent/register'); return; }
    setFamily(f);
    setChildren(getChildrenByFamily(familyId));
  }, [router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-amber-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🎉</div>
          <h1 className="text-3xl font-black text-green-500">הגדרה הושלמה!</h1>
          {family && (
            <div className="mt-4 bg-orange-100 border-2 border-orange-300 rounded-2xl p-4">
              <p className="text-sm text-gray-600 mb-1">מפתח הכניסה לילדים:</p>
              <p className="text-2xl font-black text-orange-600">{family.familyName}</p>
              <p className="text-xs text-gray-500 mt-1">הילדים יזינו את שם המשפחה + שמם האישי</p>
            </div>
          )}
        </div>

        {children.length > 0 && (
          <div className="bg-white rounded-3xl shadow p-5 mb-6">
            <h2 className="font-black text-gray-700 mb-3">הילדים שלכם:</h2>
            {children.map(child => {
              const active = child.foodOptions.filter(f => f.isActive).length;
              return (
                <div key={child.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-orange-500 bg-orange-100 px-2 py-0.5 rounded-full font-medium">
                    {active} מנות
                  </span>
                  <span className="font-bold text-gray-800">{child.name}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link
            href="/parent/setup"
            className="block text-center bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-2xl border-2 border-gray-200 transition-colors"
          >
            ✏️ חזרה לעריכה
          </Link>
          <Link
            href="/"
            className="block text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition-colors"
          >
            🏠 דף הבית
          </Link>
        </div>
      </div>
    </main>
  );
}
