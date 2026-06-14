import { Family, Child, DailySelection } from './types';

const FAMILY_KEY = 'mah_leechol_family';
const CHILDREN_KEY = 'mah_leechol_children';
const SELECTIONS_KEY = 'mah_leechol_selections';

export function saveFamily(family: Family): void {
  localStorage.setItem(FAMILY_KEY, JSON.stringify(family));
}

export function getFamily(): Family | null {
  const data = localStorage.getItem(FAMILY_KEY);
  return data ? JSON.parse(data) : null;
}

export function saveChildren(children: Child[]): void {
  localStorage.setItem(CHILDREN_KEY, JSON.stringify(children));
}

export function getChildren(): Child[] {
  const data = localStorage.getItem(CHILDREN_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveDailySelection(selection: DailySelection): void {
  const existing = getDailySelections();
  const today = new Date().toISOString().split('T')[0];
  const filtered = existing.filter(
    (s) => !(s.childId === selection.childId && s.date === today)
  );
  filtered.push(selection);
  localStorage.setItem(SELECTIONS_KEY, JSON.stringify(filtered));
}

export function getDailySelections(): DailySelection[] {
  const data = localStorage.getItem(SELECTIONS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getTodaySelections(): DailySelection[] {
  const today = new Date().toISOString().split('T')[0];
  return getDailySelections().filter((s) => s.date === today);
}
