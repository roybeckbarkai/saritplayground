'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getFamilies, getChildrenByFamily, saveChild, deleteChild, defaultFoodOptions } from '@/lib/storage';
import { Child, FoodOption, Family } from '@/lib/types';
import Link from 'next/link';

const FOOD_EMOJIS = [
  '🍳','🥚','🥪','🧀','🍕','🫓','🥗','🥫','🧈','🥣',
  '🍦','🫙','🍚','🫛','🌽','🍜','🥩','🍱','🫔','🍛',
  '🥘','🍲','🫕','🥞','🧆','🥙','🌯','🍣','🥐','🍞',
  '🥦','🥕','🍅','🧄','🍋','🍇','🍓','🍌','🥑','🫐',
];

export default function ParentSetupPage() {
  const router = useRouter();
  const [family, setFamily] = useState<Family | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [newChildName, setNewChildName] = useState('');
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [customName, setCustomName] = useState('');
  const [customEmoji, setCustomEmoji] = useState('🍽️');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    const familyId = sessionStorage.getItem('currentFamilyId');
    if (!familyId) { router.push('/parent/register'); return; }
    const f = getFamilies().find(x => x.id === familyId);
    if (!f) { router.push('/parent/register'); return; }
    setFamily(f);
    setChildren(getChildrenByFamily(familyId));
  }, [router]);

  const addChild = () => {
    if (!newChildName.trim() || !family) return;
    const child: Child = {
      id: Date.now().toString(),
      familyId: family.id,
      name: newChildName.trim(),
      createdAt: new Date().toISOString(),
      foodOptions: defaultFoodOptions(),
    };
    saveChild(child);
    setChildren(prev => [...prev, child]);
    setNewChildName('');
    setEditingChild(child);
  };

  const toggleFood = (food: FoodOption) => {
    if (!editingChild) return;
    const updated: Child = {
      ...editingChild,
      foodOptions: editingChild.foodOptions.map(f =>
        f.id === food.id ? { ...f, isActive: !f.isActive } : f
      ),
    };
    saveChild(updated);
    setEditingChild(updated);
    setChildren(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const addCustomFood = () => {
    if (!customName.trim() || !editingChild) return;
    const newFood: FoodOption = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      emoji: customEmoji,
      isActive: true,
      source: 'custom',
    };
    const updated: Child = {
      ...editingChild,
      foodOptions: [...editingChild.foodOptions, newFood],
    };
    saveChild(updated);
    setEditingChild(updated);
    setChildren(prev => prev.map(c => c.id === updated.id ? updated : c));
    setCustomName('');
    setCustomEmoji('🍽️');
    setShowEmojiPicker(false);
  };

  const removeFood = (foodId: string) => {
    if (!editingChild) return;
    const updated: Child = {
      ...editingChild,
      foodOptions: editingChild.foodOptions.filter(f => f.id !== foodId),
    };
    saveChild(updated);
    setEditingChild(updated);
    setChildren(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const removeChild = (childId: string) => {
    deleteChild(childId);
    setChildren(prev => prev.filter(c => c.id !== childId));
    if (editingChild?.id === childId) setEditingChild(null);
  };

  const activeCount = editingChild?.foodOptions.filter(f => f.isActive).length ?? 0;

  return (
    <main className="min-h-screen bg-white pb-28">
      {/* Header */}
      <div className="px-5 pt-14 pb-6">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-slate-400 text-sm">בית</Link>
          <span className="text-sm text-slate-400 font-medium">
            {family?.familyName ? `משפחת ${family.familyName}` : ''}
          </span>
        </div>

        {/* Add child */}
        <div className="flex gap-2 mb-2">
          <button
            onClick={addChild}
            className="bg-sky-500 hover:bg-sky-600 text-white font-medium w-11 h-11 rounded-xl transition-colors text-xl flex-shrink-0 flex items-center justify-center"
          >+</button>
          <input
            type="text"
            value={newChildName}
            onChange={e => setNewChildName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addChild()}
            placeholder="הוסיפו ילד/ה"
            className="flex-1 border border-slate-200 rounded-xl px-4 h-11 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-slate-900 bg-white text-sm"
          />
        </div>

        {/* Children tabs */}
        {children.length > 0 && (
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
            {children.map(child => (
              <button
                key={child.id}
                onClick={() => setEditingChild(editingChild?.id === child.id ? null : child)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  editingChild?.id === child.id
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
              >
                {child.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Food list */}
      {editingChild ? (
        <div>
          {/* Section header */}
          <div className="px-5 pb-4 border-b border-slate-100">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">מה אוהבים לאכול?</h1>
            <p className="text-sm text-slate-400 mt-1">בחרו או הוסיפו מנות שאוהבים לאכול אצלכם ושלרוב יש בבית</p>
          </div>

          {/* Food rows */}
          <div className="divide-y divide-slate-100">
            {editingChild.foodOptions.map(food => (
              <div
                key={food.id}
                onClick={() => toggleFood(food)}
                className={`flex items-center justify-between px-5 py-4 cursor-pointer transition-colors active:bg-slate-50 ${
                  food.isActive ? 'bg-white' : 'bg-white'
                }`}
              >
                {/* Left: checkbox */}
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  food.isActive
                    ? 'bg-slate-900 border-slate-900'
                    : 'border-slate-300 bg-white'
                }`}>
                  {food.isActive && (
                    <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                      <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>

                {/* Right: emoji + name */}
                <div className="flex items-center gap-3">
                  <div>
                    <span className={`text-base transition-all ${food.isActive ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                      {food.name}
                    </span>
                    {food.source === 'custom' && (
                      <span className="text-xs text-sky-500 mr-2">מותאם</span>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl flex-shrink-0">
                    {food.emoji}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add custom food */}
          <div className="px-5 pt-5 pb-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">הוספת מנה</p>
            <div className="flex gap-2">
              <button
                onClick={addCustomFood}
                disabled={!customName.trim()}
                className="bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 text-white font-medium px-4 h-11 rounded-xl transition-colors text-sm flex-shrink-0"
              >הוסף</button>
              <input
                type="text"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomFood()}
                placeholder="שם המנה"
                className="flex-1 border border-slate-200 rounded-xl px-4 h-11 focus:outline-none focus:border-sky-400 text-slate-900 text-sm bg-white min-w-0"
              />
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-11 h-11 border border-slate-200 rounded-xl bg-white hover:border-sky-300 transition-colors flex-shrink-0 flex items-center justify-center text-xl"
              >{customEmoji}</button>
            </div>
            {showEmojiPicker && (
              <div className="mt-2 grid grid-cols-8 gap-1.5 bg-slate-50 rounded-2xl p-3 border border-slate-100">
                {FOOD_EMOJIS.map(e => (
                  <button
                    key={e}
                    onClick={() => { setCustomEmoji(e); setShowEmojiPicker(false); }}
                    className="text-xl h-9 rounded-lg hover:bg-white transition-colors flex items-center justify-center"
                  >{e}</button>
                ))}
              </div>
            )}
          </div>

          {/* Active count */}
          <p className="text-center text-xs text-slate-400 mt-4 pb-2">
            {activeCount} מנות נבחרו עבור {editingChild.name}
          </p>
        </div>
      ) : children.length > 0 ? (
        <div className="px-5 py-12 text-center text-slate-400">
          <p className="text-4xl mb-3">👆</p>
          <p className="text-sm">בחרו ילד/ה למעלה כדי לערוך את המנות שלו/ה</p>
        </div>
      ) : (
        <div className="px-5 py-12 text-center text-slate-400">
          <p className="text-4xl mb-3">🧒</p>
          <p className="text-sm">הוסיפו ילד/ה למעלה כדי להתחיל</p>
        </div>
      )}

      {/* Bottom button */}
      {children.length > 0 && (
        <div className="fixed bottom-0 right-0 left-0 p-5 bg-white border-t border-slate-100">
          <Link
            href="/parent/done"
            className="block w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base py-4 rounded-2xl text-center transition-colors"
          >
            המשך
          </Link>
        </div>
      )}
    </main>
  );
}
