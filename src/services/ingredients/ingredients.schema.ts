// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema';
import type { Static } from '@feathersjs/typebox';
import { getValidator, querySyntax, Type } from '@feathersjs/typebox';

import type { HookContext } from '../../declarations';
import { dataValidator, queryValidator } from '../../validators';

// Main data model schema
export const ingredientsSchema = Type.Object(
  {
    id: Type.Number(),
    recipeId: Type.Integer(),
    name: Type.String(),
    hint: Type.Optional(Type.String()),
    amount: Type.Optional(Type.Number()),
    unit: Type.Optional(Type.String()),
  },
  { $id: 'Ingredients', additionalProperties: false },
);
export type Ingredients = Static<typeof ingredientsSchema>;
export const ingredientsValidator = getValidator(ingredientsSchema, dataValidator);
export const ingredientsResolver = resolve<Ingredients, HookContext>({});

export const ingredientsExternalResolver = resolve<Ingredients, HookContext>({});

// Schema for creating new entries
export const ingredientsDataSchema = Type.Pick(ingredientsSchema, ['recipeId', 'name'], {
  $id: 'IngredientsData',
});
export type IngredientsData = Static<typeof ingredientsDataSchema>;
export const ingredientsDataValidator = getValidator(ingredientsDataSchema, dataValidator);
export const ingredientsDataResolver = resolve<Ingredients, HookContext>({});

// Schema for updating existing entries
export const ingredientsPatchSchema = Type.Partial(ingredientsSchema, {
  $id: 'IngredientsPatch',
});
export type IngredientsPatch = Static<typeof ingredientsPatchSchema>;
export const ingredientsPatchValidator = getValidator(ingredientsPatchSchema, dataValidator);
export const ingredientsPatchResolver = resolve<Ingredients, HookContext>({});

// Schema for allowed query properties
export const ingredientsQuerySchema = Type.Intersect(
  [
    querySyntax(ingredientsSchema),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false }),
  ],
  { additionalProperties: false },
);
export type IngredientsQuery = Static<typeof ingredientsQuerySchema>;
export const ingredientsQueryValidator = getValidator(ingredientsQuerySchema, queryValidator);
export const ingredientsQueryResolver = resolve<IngredientsQuery, HookContext>({});
