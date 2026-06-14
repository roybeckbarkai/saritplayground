'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getFamily, getChildren, saveDailySelection, getTodaySelections } from '@/lib/storage';
import { Child, MasterDish, DailySelection } from '@/lib/types';
import { masterDishes } from '@/lib/mockData';
import FoodCard from '@/components/FoodCard';
import AnimatedPlate from '@/components/AnimatedPlate';

interface ChildSelections {
  [childId: string]: MasterDish[];
}

export default function TodayPage() {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [familyName, setFamilyName] = useState('');
  const [selections, setSelections] = useState<ChildSelections>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const family = getFamily();
    if (!family) { router.push('/'); return; }
    setFamilyName(family.familyName);

    const kids = getChildren();
    if (kids.length === 0) { router.push('/family/setup'); return; }
    setChildren(kids);

    const todaySelections = getTodaySelections();
    const initial: ChildSelections = {};
    kids.forEach((child) => {
      const existing = todaySelections.find((s) => s.childId === child.id);
      initial[child.id] = existing?.selectedDishes ?? [];
    });
    setSelections(initial);
  }, [router]);

  const toggleDish = (childId: string, dish: MasterDish) => {
    setSelections((prev) => {
      const current = prev[childId] ?? [];
      const exists = current.some((d) => d.id === dish.id);
      return {
        ...prev,
        [childId]: exists
          ? current.filter((d) => d.id !== dish.id)
          : [...current, dish],
      };
    });
    setSaved(false);
  };

  const handleSave = () => {
    const today = new Date().toISOString().split('T')[0];
    children.forEach((child) => {
      const sel: DailySelection = {
        childId: child.id,
        childName: child.name,
        selectedDishes: selections[child.id] ?? [],
        date: today,
      };
      saveDailySelection(sel);
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const totalSelected = Object.values(selections).reduce(
    (sum, dishes) => sum + dishes.length,
    0
  );

  const today = new Date().toLocaleDateString('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <main className="min-h-screen p-6 pb-32">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <AnimatedPlate emoji="🍽️" size={70} />
          <h1 className="text-3xl font-black text-orange-500 mt-3">
            {familyName ? `משפחת ${familyName}` : 'מה לאכול?'}
          </h1>
          <p className="text-gray-500 mt-1">{today}</p>
        </div>

        <div className="flex flex-col gap-8">
          {children.map((child) => {
            const childDishes = selections[child.id] ?? [];
            return (
              <div key={child.id} className="bg-white rounded-3xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-orange-500 bg-orange-100 rounded-full px-3 py-1">
                    {childDishes.length} נבחרו
                  </span>
                  <h2 className="text-2xl font-black text-gray-800">{child.name}</h2>
                </div>

                {childDishes.length === 0 && (
                  <p className="text-center text-gray-400 text-sm mb-4">
                    עדיין לא נבחר כלום - לחצו על מה שטעים! 👇
                  </p>
                )}

                <div className="flex flex-wrap gap-2 justify-end">
                  {masterDishes.map((dish) => (
                    <FoodCard
                      key={dish.id}
                      dish={dish}
                      selected={childDishes.some((d) => d.id === dish.id)}
                      onToggle={(d) => toggleDish(child.id, d)}
                    />
                  ))}
                </div>

                {childDishes.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100 text-right">
                    <p className="text-sm text-gray-500 mb-2 font-medium">נבחר:</p>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {childDishes.map((d) => (
                        <span
                          key={d.id}
                          className="bg-orange-100 text-orange-700 text-sm font-medium px-3 py-1 rounded-full"
                        >
                          {d.emoji} {d.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-0 right-0 left-0 p-4 bg-amber-50 border-t border-amber-100">
        <div className="max-w-2xl mx-auto">
          {saved ? (
            <div className="bg-green-500 text-white font-bold text-xl py-4 rounded-2xl text-center shadow-lg">
              🎉 נשמר! תיאבון לכולם!
            </div>
          ) : (
            <button
              onClick={handleSave}
              disabled={totalSelected === 0}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold text-xl py-4 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 disabled:cursor-not-allowed"
            >
              שמרו את הבחירה ✅
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
