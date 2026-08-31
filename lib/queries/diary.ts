import { createClient } from '@/lib/supabase/server';

export interface DailyLog {
  id: string;
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

/** Fetches all log entries for a given user + date, grouped by meal in a fixed order */
export async function getDailyLogsGrouped(userId: string, date: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('log_date', date)
    .order('created_at', { ascending: true });

  if (error) throw error;

  const logs = (data ?? []) as DailyLog[];
  const grouped = Object.fromEntries(
    MEAL_ORDER.map((meal) => [meal, logs.filter((l) => l.meal === meal)])
  ) as Record<(typeof MEAL_ORDER)[number], DailyLog[]>;

  const totals = logs.reduce(
    (acc, l) => ({
      calories: acc.calories + Number(l.calories),
      protein: acc.protein + Number(l.protein_g),
      carbs: acc.carbs + Number(l.carbs_g),
      fat: acc.fat + Number(l.fat_g),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return { grouped, totals };
}