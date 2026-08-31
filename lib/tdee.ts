export interface UserStats {
  gender: 'male' | 'female';
  age: number;
  weightKg: number;
  heightCm: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose' | 'maintain' | 'gain';
}

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_ADJUSTMENTS = {
  lose: -500,
  maintain: 0,
  gain: 500,
};

/** Calculates basal metabolic rate (BMR) using the Mifflin-St Jeor equation */
export function calculateBMR(stats: UserStats): number {
  const { gender, weightKg, heightCm, age } = stats;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
}

/** Calculates total daily energy expenditure (TDEE) adjusted for goal */
export function calculateTDEE(stats: UserStats): number {
  const bmr = calculateBMR(stats);
  const tdee = bmr * ACTIVITY_MULTIPLIERS[stats.activityLevel];
  return Math.round(tdee + GOAL_ADJUSTMENTS[stats.goal]);
}

/** Calculates recommended daily macronutrient splits (40/30/30 baseline) */
export function calculateMacros(tdee: number) {
  return {
    proteinG: Math.round((tdee * 0.3) / 4),
    carbsG: Math.round((tdee * 0.4) / 4),
    fatG: Math.round((tdee * 0.3) / 9),
  };
}