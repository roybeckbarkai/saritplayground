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
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">הגדרה הושלמה</h1>
          <p className="text-slate-400 text-sm mt-1">הכל מוכן לגלגול</p>
        </div>

        {family && (
          <div className="bg-gray-50 border border-slate-200 rounded-2xl p-5 mb-6 text-center">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">מפתח כניסה לילדים</p>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">{family.familyName}</p>
            <p className="text-xs text-slate-400 mt-2">שם משפחה + שם פרטי</p>
          </div>
        )}

        {children.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-6">
            {children.map((child, i) => {
              const active = child.foodOptions.filter(f => f.isActive).length;
              return (
                <div key={child.id}>
                  {i > 0 && <div className="h-px bg-slate-100" />}
                  <div className="flex items-center justify-between px-5 py-3.5">
                    <span className="text-sm text-slate-400">{active} מנות</span>
                    <span className="font-medium text-slate-900">{child.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link
            href="/parent/setup"
            className="block text-center bg-white hover:bg-slate-50 text-slate-700 font-medium py-3.5 rounded-2xl border border-slate-200 transition-colors text-sm"
          >
            עריכה
          </Link>
          <Link
            href="/"
            className="block text-center bg-sky-500 hover:bg-sky-600 text-white font-medium py-3.5 rounded-2xl transition-colors text-sm"
          >
            דף הבית
          </Link>
        </div>
      </div>
    </main>
  );
}
