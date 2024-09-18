// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema';
import type { Static } from '@feathersjs/typebox';
import { getValidator, querySyntax, Type } from '@feathersjs/typebox';

import type { HookContext } from '../../declarations';
import { dataValidator, queryValidator } from '../../validators';

// Main data model schema
export const recipeComponentSchema = Type.Object(
  {
    id: Type.Number(),
    text: Type.String(),
  },
  { $id: 'RecipeComponent', additionalProperties: false },
);
export type RecipeComponent = Static<typeof recipeComponentSchema>;
export const recipeComponentValidator = getValidator(recipeComponentSchema, dataValidator);
export const recipeComponentResolver = resolve<RecipeComponent, HookContext>({});

export const recipeComponentExternalResolver = resolve<RecipeComponent, HookContext>({});

// Schema for creating new entries
export const recipeComponentDataSchema = Type.Pick(recipeComponentSchema, ['text'], {
  $id: 'RecipeComponentData',
});
export type RecipeComponentData = Static<typeof recipeComponentDataSchema>;
export const recipeComponentDataValidator = getValidator(recipeComponentDataSchema, dataValidator);
export const recipeComponentDataResolver = resolve<RecipeComponent, HookContext>({});

// Schema for updating existing entries
export const recipeComponentPatchSchema = Type.Partial(recipeComponentSchema, {
  $id: 'RecipeComponentPatch',
});
export type RecipeComponentPatch = Static<typeof recipeComponentPatchSchema>;
export const recipeComponentPatchValidator = getValidator(recipeComponentPatchSchema, dataValidator);
export const recipeComponentPatchResolver = resolve<RecipeComponent, HookContext>({});

// Schema for allowed query properties
export const recipeComponentQueryProperties = Type.Pick(recipeComponentSchema, ['id', 'text']);
export const recipeComponentQuerySchema = Type.Intersect(
  [
    querySyntax(recipeComponentQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false }),
  ],
  { additionalProperties: false },
);
export type RecipeComponentQuery = Static<typeof recipeComponentQuerySchema>;
export const recipeComponentQueryValidator = getValidator(recipeComponentQuerySchema, queryValidator);
export const recipeComponentQueryResolver = resolve<RecipeComponentQuery, HookContext>({});
