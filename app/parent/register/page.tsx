'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveFamily, isFamilyNameTaken, getFamilyByEmail } from '@/lib/storage';
import { Family } from '@/lib/types';
import Link from 'next/link';

export default function ParentRegisterPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'choose' | 'register' | 'login'>('choose');
  const [familyName, setFamilyName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!familyName.trim()) { setError('נא להזין שם משפחה'); return; }
    if (!email.trim() || !email.includes('@')) { setError('נא להזין אימייל תקין'); return; }

    if (isFamilyNameTaken(familyName.trim())) {
      setError(`שם המשפחה "${familyName}" תפוס. נסו "${familyName} (2)" או שם אחר.`);
      return;
    }

    const family: Family = {
      id: Date.now().toString(),
      email: email.trim().toLowerCase(),
      familyName: familyName.trim(),
      createdAt: new Date().toISOString(),
    };
    saveFamily(family);
    sessionStorage.setItem('currentFamilyId', family.id);
    router.push('/parent/setup');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !email.includes('@')) { setError('נא להזין אימייל תקין'); return; }

    const family = getFamilyByEmail(email.trim().toLowerCase());
    if (!family) {
      setError('לא מצאנו משפחה עם האימייל הזה. אולי תרצו להירשם?');
      return;
    }
    sessionStorage.setItem('currentFamilyId', family.id);
    router.push('/parent/setup');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-amber-50">
      <div className="w-full max-w-md">
        <Link href="/" className="text-orange-400 text-sm mb-6 block text-right">→ חזרה לדף הבית</Link>

        {mode === 'choose' && (
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">👨‍👩‍👧‍👦</div>
            <h1 className="text-2xl font-black text-gray-800 mb-6">כניסת הורה</h1>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setMode('register')}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg py-4 rounded-2xl transition-colors"
              >
                הרשמה - משפחה חדשה
              </button>
              <button
                onClick={() => setMode('login')}
                className="bg-white hover:bg-gray-50 text-gray-700 font-bold text-lg py-4 rounded-2xl border-2 border-gray-200 transition-colors"
              >
                כניסה - משפחה קיימת
              </button>
            </div>
          </div>
        )}

        {mode === 'register' && (
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <button onClick={() => setMode('choose')} className="text-gray-400 text-sm mb-4 block">← חזרה</button>
            <h1 className="text-2xl font-black text-gray-800 mb-6 text-center">הרשמה חדשה</h1>
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">שם משפחה (ישמש את הילדים להתחבר)</label>
                <input
                  type="text"
                  value={familyName}
                  onChange={e => { setFamilyName(e.target.value); setError(''); }}
                  placeholder='למשל: כהן'
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-400 text-gray-800 text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">אימייל (לכניסה חוזרת)</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="example@email.com"
                  dir="ltr"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-400 text-gray-800 text-lg"
                />
              </div>
              {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
              <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xl py-4 rounded-2xl transition-colors mt-2">
                יאללה, נתחיל! 🚀
              </button>
            </form>
          </div>
        )}

        {mode === 'login' && (
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <button onClick={() => setMode('choose')} className="text-gray-400 text-sm mb-4 block">← חזרה</button>
            <h1 className="text-2xl font-black text-gray-800 mb-6 text-center">כניסה חוזרת</h1>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">אימייל</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="example@email.com"
                  dir="ltr"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-400 text-gray-800 text-lg"
                />
              </div>
              {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
              <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xl py-4 rounded-2xl transition-colors mt-2">
                כניסה
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
