'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getFamilies, getChildrenByFamily, saveChild, deleteChild, defaultFoodOptions } from '@/lib/storage';
import { Child, FoodOption, Family } from '@/lib/types';
import Link from 'next/link';

const EMOJI_OPTIONS = ['🍽️','🍜','🥩','🍱','🥪','🫔','🍛','🥘','🍲','🫕','🥞','🧆','🥙','🌯','🥗','🧁','🍰','🍣','🥐','🫙'];

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
    <main className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-5 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/parent/done" className="text-sky-500 text-sm font-medium">סיום</Link>
          <h1 className="text-base font-semibold text-slate-900">
            {family ? `משפחת ${family.familyName}` : 'הגדרות'}
          </h1>
          <Link href="/" className="text-slate-400 text-sm">בית</Link>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 flex flex-col gap-4">
        {/* Add child */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">הוספת ילד/ה</h2>
          <div className="flex gap-2">
            <button
              onClick={addChild}
              className="bg-sky-500 hover:bg-sky-600 text-white font-medium w-10 rounded-xl transition-colors text-xl flex-shrink-0"
            >+</button>
            <input
              type="text"
              value={newChildName}
              onChange={e => setNewChildName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addChild()}
              placeholder="שם הילד/ה"
              className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-slate-900 bg-white"
            />
          </div>
        </div>

        {/* Children list */}
        {children.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 pt-4 pb-2">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">ילדים</h2>
            </div>
            {children.map((child, i) => {
              const active = child.foodOptions.filter(f => f.isActive).length;
              const isEditing = editingChild?.id === child.id;
              return (
                <div key={child.id}>
                  {i > 0 && <div className="h-px bg-slate-100 mx-5" />}
                  <div
                    className={`flex items-center justify-between px-5 py-3.5 cursor-pointer transition-colors ${isEditing ? 'bg-sky-50' : 'hover:bg-slate-50'}`}
                    onClick={() => setEditingChild(isEditing ? null : child)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">{active} מנות</span>
                      {isEditing && <span className="text-xs text-sky-500 font-medium">עריכה</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-slate-900">{child.name}</span>
                      <button
                        onClick={e => { e.stopPropagation(); removeChild(child.id); }}
                        className="text-slate-300 hover:text-red-400 transition-colors text-sm"
                      >✕</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Food editor */}
        {editingChild && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-sm text-slate-400">{activeCount} פעילות</span>
              <h2 className="font-semibold text-slate-900">מנות של {editingChild.name}</h2>
            </div>

            {/* Master dishes */}
            <div className="divide-y divide-slate-100">
              {editingChild.foodOptions.filter(f => f.source === 'master').map(food => (
                <div key={food.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <button onClick={() => removeFood(food.id)} className="text-slate-200 hover:text-red-400 transition-colors text-xs">🗑</button>
                    <button
                      onClick={() => toggleFood(food)}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        food.isActive ? 'bg-sky-500 border-sky-500' : 'border-slate-300'
                      }`}
                    >
                      {food.isActive && <span className="text-white text-xs">✓</span>}
                    </button>
                  </div>
                  <span className={`text-sm ${food.isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                    {food.emoji} {food.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Custom dishes */}
            {editingChild.foodOptions.filter(f => f.source === 'custom').map(food => (
              <div key={food.id} className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50">
                <div className="flex items-center gap-3">
                  <button onClick={() => removeFood(food.id)} className="text-slate-200 hover:text-red-400 transition-colors text-xs">🗑</button>
                  <button
                    onClick={() => toggleFood(food)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                      food.isActive ? 'bg-sky-500 border-sky-500' : 'border-slate-300'
                    }`}
                  >
                    {food.isActive && <span className="text-white text-xs">✓</span>}
                  </button>
                </div>
                <span className={`text-sm ${food.isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                  {food.emoji} {food.name}
                </span>
              </div>
            ))}

            {/* Add custom */}
            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50">
              <p className="text-xs font-medium text-slate-400 mb-3 text-right">הוספת מנה מותאמת</p>
              <div className="flex gap-2">
                <button
                  onClick={addCustomFood}
                  disabled={!customName.trim()}
                  className="bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 text-white font-medium px-4 py-2 rounded-xl transition-colors text-sm flex-shrink-0"
                >הוסף</button>
                <input
                  type="text"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustomFood()}
                  placeholder="שם המנה"
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-sky-400 text-slate-900 text-sm bg-white min-w-0"
                />
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-xl border border-slate-200 rounded-xl px-3 py-2 bg-white hover:border-sky-300 transition-colors flex-shrink-0"
                >{customEmoji}</button>
              </div>
              {showEmojiPicker && (
                <div className="mt-2 flex flex-wrap gap-2 justify-end bg-white rounded-xl p-3 border border-slate-200">
                  {EMOJI_OPTIONS.map(e => (
                    <button key={e} onClick={() => { setCustomEmoji(e); setShowEmojiPicker(false); }} className="text-xl hover:scale-125 transition-transform">{e}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Done bar */}
      {children.length > 0 && (
        <div className="fixed bottom-0 right-0 left-0 p-4 bg-white border-t border-slate-200">
          <div className="max-w-lg mx-auto">
            <Link
              href="/parent/done"
              className="block w-full bg-sky-500 hover:bg-sky-600 text-white font-medium text-base py-3.5 rounded-2xl text-center transition-colors"
            >
              סיום הגדרה
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
