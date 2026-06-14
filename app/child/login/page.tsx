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
      setError('לא מצאנו אותך — בדקו שם משפחה ושם פרטי');
      return;
    }

    sessionStorage.setItem('currentChildId', child.id);
    router.push('/child/spin');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <div className="w-full max-w-sm">
        <Link href="/" className="text-slate-400 text-sm mb-8 block flex items-center gap-1">
          <span>→</span><span>חזרה</span>
        </Link>

        <div className="text-center mb-10">
          <div className="text-6xl mb-5 animate-float inline-block">🎡</div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">מי מסתובב היום?</h1>
          <p className="text-slate-400 text-sm mt-1">הזינו שם משפחה ושם פרטי</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">שם משפחה</label>
            <input
              type="text"
              value={familyName}
              onChange={e => { setFamilyName(e.target.value); setError(''); }}
              placeholder='כהן'
              className="w-full border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-slate-900 text-lg font-medium bg-white"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">שם פרטי</label>
            <input
              type="text"
              value={childName}
              onChange={e => { setChildName(e.target.value); setError(''); }}
              placeholder='נועה'
              className="w-full border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-slate-900 text-lg font-medium bg-white"
              autoComplete="off"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="bg-sky-500 hover:bg-sky-600 text-white font-medium text-base py-4 rounded-2xl transition-colors mt-2 active:scale-98"
          >
            בואו נגלגל 🎲
          </button>
        </form>
      </div>
    </main>
  );
}
