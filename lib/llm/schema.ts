import { z } from 'zod';

export const parsedRecipeSchema = z.object({
  title: z.string(),
  servings: z.number().positive(),
  ingredients: z.array(
    z.object({
      name: z.string(),
      quantity: z.string(), // free text like "2 cups" — keeps this flexible across cuisines/units
    })
  ),
  instructions: z.array(z.string()),
  caloriesTotal: z.number().nonnegative(),
  proteinGTotal: z.number().nonnegative(),
  carbsGTotal: z.number().nonnegative(),
  fatGTotal: z.number().nonnegative(),
});

export type ParsedRecipe = z.infer<typeof parsedRecipeSchema>;