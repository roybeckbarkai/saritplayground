import { Family, Child, FoodOption } from './types';
import { masterDishes } from './mockData';

const FAMILIES_KEY = 'mah_ochlin_families';
const CHILDREN_KEY = 'mah_ochlin_children';

// --- Families ---

export function getFamilies(): Family[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(FAMILIES_KEY);
  return data ? JSON.parse(data) : [];
}

export function getFamilyByName(familyName: string): Family | null {
  return getFamilies().find(f => f.familyName.toLowerCase() === familyName.toLowerCase()) ?? null;
}

export function getFamilyByEmail(email: string): Family | null {
  return getFamilies().find(f => f.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export function isFamilyNameTaken(familyName: string): boolean {
  return getFamilies().some(f => f.familyName.toLowerCase() === familyName.toLowerCase());
}

export function saveFamily(family: Family): void {
  const families = getFamilies();
  const idx = families.findIndex(f => f.id === family.id);
  if (idx >= 0) families[idx] = family;
  else families.push(family);
  localStorage.setItem(FAMILIES_KEY, JSON.stringify(families));
}

// --- Children ---

export function getChildren(): Child[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(CHILDREN_KEY);
  return data ? JSON.parse(data) : [];
}

export function getChildrenByFamily(familyId: string): Child[] {
  return getChildren().filter(c => c.familyId === familyId);
}

export function findChild(familyName: string, childName: string): Child | null {
  const family = getFamilyByName(familyName);
  if (!family) return null;
  return getChildren().find(
    c => c.familyId === family.id && c.name.trim() === childName.trim()
  ) ?? null;
}

export function saveChild(child: Child): void {
  const children = getChildren();
  const idx = children.findIndex(c => c.id === child.id);
  if (idx >= 0) children[idx] = child;
  else children.push(child);
  localStorage.setItem(CHILDREN_KEY, JSON.stringify(children));
}

export function deleteChild(childId: string): void {
  const children = getChildren().filter(c => c.id !== childId);
  localStorage.setItem(CHILDREN_KEY, JSON.stringify(children));
}

// --- Default food options for a new child ---
export function defaultFoodOptions(): FoodOption[] {
  return masterDishes.map(dish => ({
    id: dish.id,
    name: dish.name,
    emoji: dish.emoji,
    isActive: dish.isDefault,
    source: 'master' as const,
  }));
}
