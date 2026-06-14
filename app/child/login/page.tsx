'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { findChild } from '@/lib/storage';
import Link from 'next/link';

export default function ChildLoginPage() {
  const router = useRouter();
  const [familyName, setFamilyName] = useState('');
  const [childName, setChildName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!familyName.trim()) { setError('נא להזין שם משפחה'); return; }
    if (!childName.trim()) { setError('נא להזין שם פרטי'); return; }

    const child = findChild(familyName.trim(), childName.trim());
    if (!child) {
      setError('לא מצאנו אותך 😕 בדקו שם משפחה ושם פרטי');
      return;
    }

    sessionStorage.setItem('currentChildId', child.id);
    sessionStorage.setItem('currentFamilyName', familyName.trim());
    router.push('/child/spin');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-amber-50 to-orange-100">
      <div className="w-full max-w-sm">
        <Link href="/" className="text-orange-400 text-sm mb-6 block text-right">→ חזרה</Link>

        <div className="text-center mb-8">
          <div className="text-7xl mb-4 animate-float">🎡</div>
          <h1 className="text-3xl font-black text-orange-500">כניסת ילד/ה</h1>
          <p className="text-gray-500 mt-1">מי מסתובב היום?</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg p-7 flex flex-col gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">שם משפחה</label>
            <input
              type="text"
              value={familyName}
              onChange={e => { setFamilyName(e.target.value); setError(''); }}
              placeholder='למשל: כהן'
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-400 text-gray-800 text-xl font-bold"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">שם פרטי</label>
            <input
              type="text"
              value={childName}
              onChange={e => { setChildName(e.target.value); setError(''); }}
              placeholder='השם שלי'
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-400 text-gray-800 text-xl font-bold"
            />
          </div>
          {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white font-black text-2xl py-4 rounded-2xl transition-colors shadow-md active:scale-95"
          >
            בואו נגלגל! 🎲
          </button>
        </form>
      </div>
    </main>
  );
}
