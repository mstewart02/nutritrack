import Anthropic from '@anthropic-ai/sdk';
import { parsedRecipeSchema, type ParsedRecipe } from './schema';
import { RECIPE_EXTRACTION_SYSTEM_PROMPT } from './prompts';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Forcing a tool call is the most reliable way to get schema-conformant JSON —
// no markdown fences, no "Here's your JSON:" preamble to strip.
const RECIPE_TOOL = {
  name: 'extract_recipe',
  description: 'Return structured recipe and nutrition data extracted from the source content.',
  input_schema: {
    type: 'object' as const,
    properties: {
      title: { type: 'string' },
      servings: { type: 'number' },
      ingredients: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            quantity: { type: 'string' },
          },
          required: ['name', 'quantity'],
        },
      },
      instructions: { type: 'array', items: { type: 'string' } },
      caloriesTotal: { type: 'number' },
      proteinGTotal: { type: 'number' },
      carbsGTotal: { type: 'number' },
      fatGTotal: { type: 'number' },
    },
    required: [
      'title', 'servings', 'ingredients', 'instructions',
      'caloriesTotal', 'proteinGTotal', 'carbsGTotal', 'fatGTotal',
    ],
  },
};

function extractToolInput(response: Anthropic.Message): unknown {
  const toolUseBlock = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
  );
  if (!toolUseBlock) throw new Error('Model did not return structured data');
  return toolUseBlock.input;
}

export async function parseRecipeFromText(pageText: string): Promise<{ parsed: ParsedRecipe; raw: unknown }> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 2000,
    system: RECIPE_EXTRACTION_SYSTEM_PROMPT,
    tools: [RECIPE_TOOL],
    tool_choice: { type: 'tool', name: 'extract_recipe' },
    messages: [
      { role: 'user', content: `Extract the recipe from this page content:\n\n${pageText.slice(0, 15000)}` },
    ],
  });

  const raw = extractToolInput(response);
  const parsed = parsedRecipeSchema.parse(raw);
  return { parsed, raw };
}

export async function parseRecipeFromImage(
  base64Image: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'
): Promise<{ parsed: ParsedRecipe; raw: unknown }> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 2000,
    system: RECIPE_EXTRACTION_SYSTEM_PROMPT,
    tools: [RECIPE_TOOL],
    tool_choice: { type: 'tool', name: 'extract_recipe' },
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Image } },
          { type: 'text', text: 'Extract the recipe shown in this screenshot.' },
        ],
      },
    ],
  });

  const raw = extractToolInput(response);
  const parsed = parsedRecipeSchema.parse(raw);
  return { parsed, raw };
}