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
  foodOptions: FoodOption[];
}

export interface FoodOption {
  id: string;
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
