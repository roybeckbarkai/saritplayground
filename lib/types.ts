export interface Family {
  id: string;
  email: string;
  familyName: string;
  createdAt: string;
}

export interface Child {
  id: string;
  familyId: string;
  name: string;
  createdAt: string;
}

export interface FoodOption {
  id: string;
  childId: string;
  name: string;
  emoji: string;
  isActive: boolean;
  source: 'master' | 'custom';
}

export interface MasterDish {
  id: string;
  name: string;
  emoji: string;
  isDefault: boolean;
}

export interface DailySelection {
  childId: string;
  childName: string;
  selectedDishes: MasterDish[];
  date: string;
}
