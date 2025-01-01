// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema';
import type { Static } from '@feathersjs/typebox';
import { getValidator, querySyntax, Type } from '@feathersjs/typebox';

import type { HookContext } from '../../declarations';
import { dataValidator, queryValidator } from '../../validators';
import { app } from '../../app';
import { BadRequest, NotFound } from '@feathersjs/errors';
import { QueryResult } from 'pg';

// Main data model schema
export const recipeComponentSchema = Type.Object(
  {
    id: Type.Number(),
    recipeId: Type.Integer(),
    type: Type.Enum({
      'ul': 'ul',
      'ol': 'ol',
      'text': 'text',
      'subtitle': 'subtitle',
      'image': 'image',
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
export const recipeComponentDataSchema = Type.Pick(recipeComponentSchema, ['recipeId', 'type', 'content', 'listContent', 'note', 'sortingOrder'], {
  $id: 'RecipeComponentData',
});
export type RecipeComponentData = Static<typeof recipeComponentDataSchema>;
export const recipeComponentDataValidator = getValidator(recipeComponentDataSchema, dataValidator);
export const recipeComponentDataResolver = resolve<RecipeComponent, HookContext>({
  recipeId: async (value, _, ctx) => {
    const recipesWithId = (await app.get('postgresqlClient')('recipe').count('*').where({
      'id': value,
      'ownerId': ctx.params.user.uuid,
    }));
    if (recipesWithId.length <= 0) throw new BadRequest(`There is no recipe with id ${value} owned by user with id ${ctx.params.user.uuid}!`);
    return value;
  },
  content: async (value, recipeComponent) => {
    if (recipeComponent.type === 'text' || recipeComponent.type === 'subtitle' || recipeComponent.type === 'image') {
      if (!value) throw new BadRequest('content has to be a non-undefined value (string) when type is text, subtitle or image.');
    } else {
      if (value) throw new BadRequest('content shall not be set when type is not text, subtitle or image.');
    }
    return value;
  },
  listContent: async (value, recipeComponent) => {
    if (recipeComponent.type === 'ul' || recipeComponent.type === 'ol') {
      if (!value) throw new BadRequest('listContent has to be a non-undefined value (string[]) when type is ul or ol.');
    } else {
      if (value) throw new BadRequest('listContent shall not be set when type is not ul or ol');
    }

    return value;
  },
  sortingOrder: async (value) => {
    if (value === undefined || value < 0) throw new BadRequest(`sortingOrder has to be a value greater than 0 current: ${value}`);
    return value;
  },
});

// Schema for updating existing entries
export const recipeComponentPatchSchema = Type.Partial(recipeComponentSchema, {
  $id: 'RecipeComponentPatch',
});
export type RecipeComponentPatch = Static<typeof recipeComponentPatchSchema>;
export const recipeComponentPatchValidator = getValidator(recipeComponentPatchSchema, dataValidator);
export const recipeComponentPatchResolver = resolve<RecipeComponent, HookContext>({
  id: async (value, recipeComponent, ctx) => {
    const id = value ?? ctx.id;
    console.log(id, recipeComponent);
    const recipeOwner = (await app.get('postgresqlClient').raw('SELECT "ownerId" FROM "recipe-component" JOIN "recipe" r on "recipe-component"."recipeId" = r.id WHERE "recipe-component".id = :id', {
      id,
    })) as QueryResult;
    console.log(recipeOwner);
    if (!recipeOwner) throw new NotFound('The recipe parenting this component was not found or does not belong to the requesting user.');
    return value;
  },
});

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
