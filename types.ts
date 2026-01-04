
export type Language = 'EN' | 'RU';
export type UserProfile = 'Ron' | 'Evgeny';
export type PortionSize = 'Small' | 'Medium' | 'Large';
export type Timeframe = 'Day' | 'Week' | 'Month' | 'All';

export interface MealEntry {
  id: string;
  userId: UserProfile;
  timestamp: number;
  description: string;
  portion: PortionSize;
  images: string[];
  aiAssessment: string;
}

export interface WeightEntry {
  id: string;
  userId: UserProfile;
  timestamp: number;
  weight: number;
}

export interface UserStats {
  usedFreezeTokens: number;
}

export interface Localization {
  appName: string;
  home: string;
  timeline: string;
  weight: string;
  insights: string;
  profile: string;
  logMeal: string;
  description: string;
  portion: string;
  small: string;
  medium: string;
  large: string;
  save: string;
  cancel: string;
  noData: string;
  addWeight: string;
  currentWeight: string;
  change: string;
  timeframeDay: string;
  timeframeWeek: string;
  timeframeMonth: string;
  timeframeAll: string;
  dominantHabit: string;
  consistencyScore: string;
  mealTiming: string;
  privacyNote: string;
  userNames: Record<UserProfile, string>;
  aiAnalysis: string;
  streak: string;
  healthy: string;
  unhealthy: string;
  freezeTokens: string;
}
