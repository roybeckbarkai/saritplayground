'use client';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <div className="w-full max-w-sm text-center">
        <div className="text-7xl mb-6 animate-float">🎡</div>
        <h1 className="text-3xl font-semibold text-slate-900 mb-1 tracking-tight">מה אוכלים הערב?</h1>
        <p className="text-slate-400 mb-12 text-base">גלגל המזל של המשפחה</p>

        <div className="flex flex-col gap-3">
          <Link
            href="/child/login"
            className="bg-sky-500 hover:bg-sky-600 text-white font-medium text-lg py-4 rounded-2xl transition-all duration-200 active:scale-98 flex items-center justify-center gap-2"
          >
            <span>אני ילד/ה</span>
            <span>🧒</span>
          </Link>

          <Link
            href="/parent/register"
            className="bg-white hover:bg-slate-50 text-slate-700 font-medium text-base py-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all duration-200 active:scale-98 flex items-center justify-center gap-2"
          >
            <span>אני הורה</span>
            <span>👤</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
