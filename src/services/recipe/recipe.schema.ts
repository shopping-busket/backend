// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema';
import type { Static } from '@feathersjs/typebox';
import { getValidator, querySyntax, Type } from '@feathersjs/typebox';

import type { HookContext } from '../../declarations';
import { dataValidator, queryValidator } from '../../validators';

// Main data model schema
export const recipeSchema = Type.Object(
  {
    id: Type.Number(),
    title: Type.String(),
    description: Type.String(),
    ownerId: Type.Integer(),
  },
  { $id: 'Recipe', additionalProperties: false },
);
export type Recipe = Static<typeof recipeSchema>;
export const recipeValidator = getValidator(recipeSchema, dataValidator);
export const recipeResolver = resolve<Recipe, HookContext>({});

export const recipeExternalResolver = resolve<Recipe, HookContext>({});

// Schema for creating new entries
export const recipeDataSchema = Type.Pick(recipeSchema, ['title', 'description'], {
  $id: 'RecipeData',
});
export type RecipeData = Static<typeof recipeDataSchema>;
export const recipeDataValidator = getValidator(recipeDataSchema, dataValidator);
export const recipeDataResolver = resolve<Recipe, HookContext>({
  ownerId: async (value, recipe, ctx) => ctx.params.user.uuid,
});

// Schema for updating existing entries
export const recipePatchSchema = Type.Partial(recipeSchema, {
  $id: 'RecipePatch',
});
export type RecipePatch = Static<typeof recipePatchSchema>;
export const recipePatchValidator = getValidator(recipePatchSchema, dataValidator);
export const recipePatchResolver = resolve<Recipe, HookContext>({});

// Schema for allowed query properties
export const recipeQueryProperties = Type.Pick(recipeSchema, ['id', 'title', 'description', 'ownerId']);
export const recipeQuerySchema = Type.Intersect(
  [
    querySyntax(recipeQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false }),
  ],
  { additionalProperties: false },
);
export type RecipeQuery = Static<typeof recipeQuerySchema>;
export const recipeQueryValidator = getValidator(recipeQuerySchema, queryValidator);
export const recipeQueryResolver = resolve<RecipeQuery, HookContext>({});
