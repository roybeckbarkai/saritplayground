'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getFamily, saveChildren, getChildren } from '@/lib/storage';
import { Child } from '@/lib/types';

export default function SetupPage() {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [newName, setNewName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const family = getFamily();
    if (!family) {
      router.push('/');
      return;
    }
    setFamilyName(family.familyName);
    const saved = getChildren();
    if (saved.length > 0) setChildren(saved);
  }, [router]);

  const addChild = () => {
    if (!newName.trim()) {
      setError('נא להזין שם ילד/ה');
      return;
    }
    const child: Child = {
      id: Date.now().toString(),
      familyId: getFamily()!.id,
      name: newName.trim(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...children, child];
    setChildren(updated);
    saveChildren(updated);
    setNewName('');
    setError('');
  };

  const removeChild = (id: string) => {
    const updated = children.filter((c) => c.id !== id);
    setChildren(updated);
    saveChildren(updated);
  };

  const handleDone = () => {
    if (children.length === 0) {
      setError('נא להוסיף לפחות ילד/ה אחד/ת');
      return;
    }
    router.push('/family/today');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addChild();
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">👨‍👩‍👧‍👦</div>
          <h1 className="text-3xl font-black text-orange-500">
            {familyName ? `משפחת ${familyName}` : 'מי הילדים?'}
          </h1>
          <p className="text-gray-500 mt-1">הוסיפו את הילדים שלכם</p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8 flex flex-col gap-5">
          <div className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => { setNewName(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
              placeholder="שם הילד/ה"
              className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-right focus:outline-none focus:border-orange-400 text-gray-800 text-lg"
            />
            <button
              onClick={addChild}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xl px-5 rounded-xl transition-colors active:scale-95"
            >
              +
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-sm font-medium text-center">{error}</p>
          )}

          {children.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-5xl mb-3">🧒</div>
              <p className="text-lg">אין עדיין ילדים, בואו נוסיף!</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {children.map((child, i) => (
                <li
                  key={child.id}
                  className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl px-4 py-3"
                >
                  <button
                    onClick={() => removeChild(child.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors text-xl leading-none"
                  >
                    ✕
                  </button>
                  <span className="font-bold text-gray-700 text-lg">
                    {['🧒', '👧', '👦', '🧑'][i % 4]} {child.name}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <button
            onClick={handleDone}
            disabled={children.length === 0}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold text-xl py-4 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 disabled:cursor-not-allowed"
          >
            סיימתי! ✅
          </button>
        </div>
      </div>
    </main>
  );
}
