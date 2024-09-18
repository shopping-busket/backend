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
    recipeId: Type.Integer(),
    type: Type.Enum({
      "ul": "ul",
      "ol": "ol",
      "text": "text",
      "subtitle": "subtitle",
      "image": "image",
    }),
    content: Type.Optional(Type.String()),
    listContent: Type.Optional(Type.Array(Type.String())),
    note: Type.Optional(Type.String()),
    sortingOrder: Type.Number(),
  },
  { $id: 'RecipeComponent', additionalProperties: false },
);
export type RecipeComponent = Static<typeof recipeComponentSchema>;
export const recipeComponentValidator = getValidator(recipeComponentSchema, dataValidator);
export const recipeComponentResolver = resolve<RecipeComponent, HookContext>({});

export const recipeComponentExternalResolver = resolve<RecipeComponent, HookContext>({});

// Schema for creating new entries
export const recipeComponentDataSchema = Type.Pick(recipeComponentSchema, ['type', 'content', 'listContent', 'note', 'sortingOrder'], {
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
export const recipeComponentQueryProperties = recipeComponentSchema;
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
