// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema';
import type { Static } from '@feathersjs/typebox';
import { getValidator, querySyntax, Type } from '@feathersjs/typebox';

import type { HookContext } from '../../declarations';
import { dataValidator, queryValidator } from '../../validators';
import { app } from '../../app';
import { BadRequest, Forbidden } from '@feathersjs/errors';

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

/**
 * Hook: Require user to be the recipe's owner
 * @param ctx the HookContext containing `ctx.id` is used as recipeId if recipeId is not passed
 * @param recipeId used instead of `ctx.id` if passed
 */
export const requireRecipeOwner = async (ctx: HookContext, recipeId?: number): Promise<HookContext> => {
  if (!(recipeId ?? ctx.id)) throw new BadRequest('Recipe id not specified in ctx.params id and recipeId');
  const recipe = await app.service('recipe').get(recipeId ?? ctx.id!);
  if (recipe.ownerId === ctx.params.user.uuid) return ctx;
  throw new Forbidden('You are not allowed to the this recipe!');
};

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
export const recipePatchSchema = Type.Partial(Type.Omit(recipeSchema, ['id', 'ownerId']), {
  $id: 'RecipePatch',
});
export type RecipePatch = Static<typeof recipePatchSchema>;
export const recipePatchValidator = getValidator(recipePatchSchema, dataValidator);
export const recipePatchResolver = resolve<Recipe, HookContext>({
  ownerId: async (value, recipe, ctx) => ctx.params.user.uuid,
});

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
