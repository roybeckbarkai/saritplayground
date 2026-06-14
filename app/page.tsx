'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveFamily } from '@/lib/storage';
import { Family } from '@/lib/types';
import AnimatedPlate from '@/components/AnimatedPlate';

export default function HomePage() {
  const router = useRouter();
  const [familyName, setFamilyName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyName.trim()) {
      setError('נא להזין שם משפחה');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('נא להזין אימייל תקין');
      return;
    }

    const family: Family = {
      id: Date.now().toString(),
      email: email.trim(),
      familyName: familyName.trim(),
      createdAt: new Date().toISOString(),
    };

    saveFamily(family);
    router.push('/family/setup');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <AnimatedPlate emoji="🍽️" size={90} />
          <h1 className="text-5xl font-black text-orange-500 mt-4 mb-2">מה לאכול?</h1>
          <p className="text-gray-500 text-lg">בחירת ארוחות לילדים, בקלות ובכיף</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg p-8 flex flex-col gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">שם משפחה</label>
            <input
              type="text"
              value={familyName}
              onChange={(e) => { setFamilyName(e.target.value); setError(''); }}
              placeholder="למשל: משפחת כהן"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-right focus:outline-none focus:border-orange-400 text-gray-800 text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">אימייל</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="example@email.com"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-right focus:outline-none focus:border-orange-400 text-gray-800 text-lg"
              dir="ltr"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm font-medium text-center">{error}</p>
          )}

          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xl py-4 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
          >
            בואו נתחיל! 🚀
          </button>
        </form>
      </div>
    </main>
  );
}
