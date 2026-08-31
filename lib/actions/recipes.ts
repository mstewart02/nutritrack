'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { ParsedRecipe } from '@/lib/llm/schema';

export async function saveRecipe(input: {
  parsed: ParsedRecipe;
  sourceType: 'url' | 'image';
  sourceUrl?: string;
  rawLlmResponse?: unknown;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { parsed, sourceType, sourceUrl, rawLlmResponse } = input;

  const { data, error } = await supabase
    .from('recipes')
    .insert({
      user_id: user.id,
      title: parsed.title,
      source_type: sourceType,
      source_url: sourceUrl ?? null,
      ingredients: parsed.ingredients,
      instructions: parsed.instructions,
      servings: parsed.servings,
      calories_total: parsed.caloriesTotal,
      protein_g_total: parsed.proteinGTotal,
      carbs_g_total: parsed.carbsGTotal,
      fat_g_total: parsed.fatGTotal,
      raw_llm_response: rawLlmResponse ?? null,
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);

  redirect(`/recipes/${data.id}`);
}