'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function addLogEntry(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const meal = formData.get('meal') as string;
  const foodName = formData.get('foodName') as string;
  const quantity = Number(formData.get('quantity') || 1);
  const unit = (formData.get('unit') as string) || 'serving';
  
  const caloriesRaw = formData.get('calories');
  const calories = caloriesRaw !== null && caloriesRaw !== '' ? Number(caloriesRaw) : NaN;
  const proteinG = Number(formData.get('proteinG') || 0);
  const carbsG = Number(formData.get('carbsG') || 0);
  const fatG = Number(formData.get('fatG') || 0);

  if (!foodName || !meal || Number.isNaN(calories)) {
    throw new Error('Missing required fields');
  }

  const { error } = await supabase.from('daily_logs').insert({
    user_id: user.id,
    meal,
    food_name: foodName,
    quantity,
    unit,
    calories,
    protein_g: proteinG,
    carbs_g: carbsG,
    fat_g: fatG,
  });

  if (error) throw new Error(error.message);

  revalidatePath('/diary');
  revalidatePath('/dashboard');
  redirect('/diary');
}

export async function deleteLogEntry(logId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { error } = await supabase
    .from('daily_logs')
    .delete()
    .eq('id', logId)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);

  revalidatePath('/diary');
  revalidatePath('/dashboard');
}
export async function addRecipeToDiary(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const recipeId = formData.get('recipeId') as string;
  const meal = formData.get('meal') as string;
  const servingsToLog = Number(formData.get('servings'));

  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', recipeId)
    .eq('user_id', user.id)
    .single();

  if (recipeError || !recipe) throw new Error('Recipe not found');

  // Scale the recipe's total macros down to the fraction the user is actually eating
  const ratio = servingsToLog / recipe.servings;

  const { error } = await supabase.from('daily_logs').insert({
    user_id: user.id,
    meal,
    food_name: recipe.title,
    quantity: servingsToLog,
    unit: 'serving',
    calories: Math.round(recipe.calories_total * ratio),
    protein_g: Math.round(recipe.protein_g_total * ratio),
    carbs_g: Math.round(recipe.carbs_g_total * ratio),
    fat_g: Math.round(recipe.fat_g_total * ratio),
    source: 'recipe_import',
    recipe_id: recipeId,
  });

  if (error) throw new Error(error.message);

  revalidatePath('/diary');
  revalidatePath('/dashboard');
  redirect('/diary');
}