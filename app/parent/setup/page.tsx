'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getFamilies, getChildrenByFamily, saveChild, deleteChild, defaultFoodOptions } from '@/lib/storage';
import { Child, FoodOption, Family } from '@/lib/types';
import { masterDishes } from '@/lib/mockData';
import Link from 'next/link';

const EMOJI_OPTIONS = ['🍽️','🍜','🥩','🍱','🥪','🫔','🍛','🥘','🍲','🫕','🥞','🧆','🥙','🌯','🥗'];

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
    const all = getFamilies();
    const f = all.find(x => x.id === familyId);
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
    <main className="min-h-screen bg-amber-50 p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-orange-400 text-sm">→ דף הבית</Link>
          <h1 className="text-xl font-black text-gray-800">
            {family ? `משפחת ${family.familyName}` : ''}
          </h1>
        </div>

        {/* Add child */}
        <div className="bg-white rounded-3xl shadow p-5 mb-4">
          <h2 className="font-black text-gray-700 mb-3 text-lg">הוספת ילד/ה</h2>
          <div className="flex gap-2">
            <button
              onClick={addChild}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 rounded-xl transition-colors text-xl"
            >+</button>
            <input
              type="text"
              value={newChildName}
              onChange={e => setNewChildName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addChild()}
              placeholder="שם הילד/ה"
              className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-orange-400 text-gray-800 text-lg"
            />
          </div>
        </div>

        {/* Children list */}
        {children.length > 0 && (
          <div className="bg-white rounded-3xl shadow p-5 mb-4">
            <h2 className="font-black text-gray-700 mb-3 text-lg">ילדים</h2>
            <div className="flex flex-col gap-2">
              {children.map(child => {
                const active = child.foodOptions.filter(f => f.isActive).length;
                return (
                  <div
                    key={child.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border-2 cursor-pointer transition-colors ${
                      editingChild?.id === child.id
                        ? 'border-orange-400 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-200'
                    }`}
                    onClick={() => setEditingChild(child)}
                  >
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={e => { e.stopPropagation(); removeChild(child.id); }}
                        className="text-gray-300 hover:text-red-400 text-lg transition-colors"
                      >✕</button>
                      <span className="text-sm text-orange-500 bg-orange-100 px-2 py-0.5 rounded-full font-medium">
                        {active} מנות
                      </span>
                    </div>
                    <span className="font-bold text-gray-800 text-lg">{child.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Food editor */}
        {editingChild && (
          <div className="bg-white rounded-3xl shadow p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-orange-500 font-medium bg-orange-100 px-3 py-1 rounded-full">
                {activeCount} מנות פעילות
              </span>
              <h2 className="font-black text-gray-800 text-xl">מנות של {editingChild.name}</h2>
            </div>

            {/* Master dishes */}
            <div className="mb-5">
              <p className="text-sm font-bold text-gray-500 mb-3 text-right">מנות בסיס — סמנו אילו רלוונטיות</p>
              <div className="flex flex-col gap-2">
                {editingChild.foodOptions.filter(f => f.source === 'master').map(food => (
                  <div
                    key={food.id}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      food.isActive
                        ? 'border-orange-300 bg-orange-50'
                        : 'border-gray-100 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => removeFood(food.id)}
                        className="text-gray-300 hover:text-red-400 text-sm transition-colors"
                        title="הסר לגמרי"
                      >🗑️</button>
                      <button
                        onClick={() => toggleFood(food)}
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                          food.isActive ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-300'
                        }`}
                      >
                        {food.isActive && '✓'}
                      </button>
                    </div>
                    <span className="font-medium text-gray-700">
                      {food.emoji} {food.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom dishes */}
            {editingChild.foodOptions.filter(f => f.source === 'custom').length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-bold text-gray-500 mb-3 text-right">מנות מותאמות אישית</p>
                <div className="flex flex-col gap-2">
                  {editingChild.foodOptions.filter(f => f.source === 'custom').map(food => (
                    <div
                      key={food.id}
                      className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        food.isActive ? 'border-purple-300 bg-purple-50' : 'border-gray-100 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="flex gap-2 items-center">
                        <button onClick={() => removeFood(food.id)} className="text-gray-300 hover:text-red-400 text-sm">🗑️</button>
                        <button
                          onClick={() => toggleFood(food)}
                          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                            food.isActive ? 'bg-purple-500 border-purple-500 text-white' : 'border-gray-300'
                          }`}
                        >
                          {food.isActive && '✓'}
                        </button>
                      </div>
                      <span className="font-medium text-gray-700">{food.emoji} {food.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add custom */}
            <div className="border-t-2 border-gray-100 pt-4">
              <p className="text-sm font-bold text-gray-500 mb-3 text-right">הוסיפו מנה שלא ברשימה</p>
              <div className="flex gap-2 items-center">
                <button
                  onClick={addCustomFood}
                  disabled={!customName.trim()}
                  className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white font-bold px-4 py-2.5 rounded-xl transition-colors"
                >
                  הוסף
                </button>
                <input
                  type="text"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustomFood()}
                  placeholder="שם המנה"
                  className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-400 text-gray-800"
                />
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-2xl border-2 border-gray-200 rounded-xl px-3 py-2 hover:border-purple-300 transition-colors"
                >
                  {customEmoji}
                </button>
              </div>
              {showEmojiPicker && (
                <div className="mt-2 flex flex-wrap gap-2 justify-end bg-gray-50 rounded-xl p-3">
                  {EMOJI_OPTIONS.map(e => (
                    <button
                      key={e}
                      onClick={() => { setCustomEmoji(e); setShowEmojiPicker(false); }}
                      className="text-2xl hover:scale-125 transition-transform"
                    >{e}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Done button */}
        {children.length > 0 && (
          <div className="fixed bottom-0 right-0 left-0 p-4 bg-amber-50 border-t border-amber-200">
            <div className="max-w-2xl mx-auto">
              <Link
                href="/parent/done"
                className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold text-xl py-4 rounded-2xl text-center transition-colors shadow-md"
              >
                סיימתי להגדיר ✅
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
