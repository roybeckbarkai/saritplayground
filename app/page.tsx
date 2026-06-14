'use client';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-amber-50 to-orange-100">
      <div className="w-full max-w-sm text-center">
        <div className="text-8xl mb-4 animate-float">🎡</div>
        <h1 className="text-4xl font-black text-orange-500 mb-2">מה אוכלים הערב?</h1>
        <p className="text-gray-500 mb-10 text-lg">גלגל המזל של המשפחה</p>

        <div className="flex flex-col gap-4">
          <Link
            href="/child/login"
            className="bg-orange-500 hover:bg-orange-600 text-white font-black text-2xl py-5 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-3"
          >
            <span>אני ילד/ה</span>
            <span className="text-3xl">🧒</span>
          </Link>

          <Link
            href="/parent/register"
            className="bg-white hover:bg-gray-50 text-gray-700 font-bold text-xl py-4 rounded-3xl shadow border-2 border-gray-200 hover:border-orange-300 transition-all duration-200 active:scale-95 flex items-center justify-center gap-3"
          >
            <span>אני הורה</span>
            <span className="text-2xl">👨‍👩‍👧‍👦</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
