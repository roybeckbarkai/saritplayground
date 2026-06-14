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
      setError('לא מצאנו משפחה עם האימייל הזה');
      return;
    }
    sessionStorage.setItem('currentFamilyId', family.id);
    router.push('/parent/setup');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <div className="w-full max-w-sm">
        <Link href="/" className="text-slate-400 text-sm mb-8 block flex items-center gap-1">
          <span>→</span><span>חזרה</span>
        </Link>

        {mode === 'choose' && (
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 mb-1 tracking-tight">כניסת הורה</h1>
            <p className="text-slate-400 text-sm mb-8">ניהול ילדים ורשימות מזון</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setMode('register')}
                className="bg-sky-500 hover:bg-sky-600 text-white font-medium text-base py-4 rounded-2xl transition-colors"
              >
                משפחה חדשה — הרשמה
              </button>
              <button
                onClick={() => setMode('login')}
                className="bg-white hover:bg-slate-50 text-slate-700 font-medium text-base py-4 rounded-2xl border border-slate-200 transition-colors"
              >
                משפחה קיימת — כניסה
              </button>
            </div>
          </div>
        )}

        {mode === 'register' && (
          <div>
            <button onClick={() => setMode('choose')} className="text-slate-400 text-sm mb-6 flex items-center gap-1">
              <span>←</span><span>חזרה</span>
            </button>
            <h1 className="text-2xl font-semibold text-slate-900 mb-1">הרשמה</h1>
            <p className="text-slate-400 text-sm mb-8">יצירת משפחה חדשה</p>
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">שם משפחה</label>
                <input
                  type="text"
                  value={familyName}
                  onChange={e => { setFamilyName(e.target.value); setError(''); }}
                  placeholder='כהן'
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-slate-900 text-base bg-white"
                />
                <p className="text-xs text-slate-400 mt-1">הילדים ישתמשו בשם זה להתחבר</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">אימייל</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@example.com"
                  dir="ltr"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-slate-900 text-base bg-white"
                />
                <p className="text-xs text-slate-400 mt-1">לכניסה חוזרת בלבד, לא נשלח כלום</p>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white font-medium text-base py-4 rounded-2xl transition-colors mt-2">
                יצירת חשבון
              </button>
            </form>
          </div>
        )}

        {mode === 'login' && (
          <div>
            <button onClick={() => setMode('choose')} className="text-slate-400 text-sm mb-6 flex items-center gap-1">
              <span>←</span><span>חזרה</span>
            </button>
            <h1 className="text-2xl font-semibold text-slate-900 mb-1">כניסה</h1>
            <p className="text-slate-400 text-sm mb-8">הזינו את האימייל שרשמתם</p>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">אימייל</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@example.com"
                  dir="ltr"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-slate-900 text-base bg-white"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white font-medium text-base py-4 rounded-2xl transition-colors mt-2">
                כניסה
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
