// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema';
import type { Static } from '@feathersjs/typebox';
import { getValidator, querySyntax, Type } from '@feathersjs/typebox';

import type { HookContext } from '../../declarations';
import { dataValidator, queryValidator } from '../../validators';
import type { RecipeStepsService } from './recipe-steps.class';
import { app } from '../../app';
import { BadRequest, NotFound } from '@feathersjs/errors';
import sanitizeHtml from 'sanitize-html';
import { QueryResult } from 'pg';

// Main data model schema
export const recipeStepsSchema = Type.Object(
  {
    id: Type.Number(),
    recipeId: Type.Number(),
    stepNumber: Type.Number({ minimum: 1 }),
    title: Type.String(),
    content: Type.String(),

    headerImagePath: Type.Optional(Type.String()),
    headerImageAlt: Type.Optional(Type.String()),
    headerImageNote: Type.Optional(Type.String()),
  },
  { $id: 'RecipeSteps', additionalProperties: false },
);
export type RecipeSteps = Static<typeof recipeStepsSchema>
export const recipeStepsValidator = getValidator(recipeStepsSchema, dataValidator);
export const recipeStepsResolver = resolve<RecipeSteps, HookContext<RecipeStepsService>>({});
export const HTMLSanitizerOptions: sanitizeHtml.IOptions = {
  allowedTags: ['b', 's', 'i', 'em', 'strong', 'ul', 'ol', 'li'],
  allowedAttributes: {},
  allowedIframeHostnames: [],
};


export const recipeStepsExternalResolver = resolve<RecipeSteps, HookContext<RecipeStepsService>>({});

// Schema for creating new entries
export const recipeStepsDataSchema = Type.Pick(recipeStepsSchema, [
  'recipeId', 'stepNumber', 'title', 'content',
], {
  $id: 'RecipeStepsData',
});
export type RecipeStepsData = Static<typeof recipeStepsDataSchema>
export const recipeStepsDataValidator = getValidator(recipeStepsDataSchema, dataValidator);
export const recipeStepsDataResolver = resolve<RecipeSteps, HookContext<RecipeStepsService>>({
  recipeId: async (value, _, ctx) => {
    const recipesWithId = (await app.get('postgresqlClient')('recipe').count('*').where({
      'id': value,
      'ownerId': ctx.params.user?.uuid,
    }));
    if (recipesWithId.length <= 0) throw new BadRequest(`There is no recipe with id ${value} owned by user with id ${ctx.params.user?.uuid}!`);
    return value;
  },
  content: async (value) => {
    if (!value) throw new BadRequest('content shall not be undefined!');
    return sanitizeHtml(value, HTMLSanitizerOptions);
  },
});

// Schema for updating existing entries
export const recipeStepsPatchSchema = Type.Partial(recipeStepsSchema, {
  $id: 'RecipeStepsPatch',
});
export type RecipeStepsPatch = Static<typeof recipeStepsPatchSchema>
export const recipeStepsPatchValidator = getValidator(recipeStepsPatchSchema, dataValidator);
export const recipeStepsPatchResolver = resolve<RecipeSteps, HookContext<RecipeStepsService>>({
  id: async (value, recipeStep, ctx) => {
    const id = value ?? ctx.id;
    console.log(id, recipeStep);
    const recipeOwner = (await app.get('postgresqlClient').raw('SELECT "ownerId" FROM "recipe-steps" JOIN "recipe" r on "recipe-steps"."recipeId" = r.id WHERE "recipe-steps".id = :id', {
      id,
    })) as QueryResult;
    console.log(recipeOwner);
    if (!recipeOwner) throw new NotFound('The recipe parenting this step was not found or does not belong to the requesting user.');
    return value;
  },
  content: async (value) => {
    if (!value) throw new BadRequest('content shall not be undefined!');
    return sanitizeHtml(value, HTMLSanitizerOptions);
  },
});

// Schema for allowed query properties
export const recipeStepsQueryProperties = Type.Pick(recipeStepsSchema, ['id']);
export const recipeStepsQuerySchema = Type.Intersect(
  [
    querySyntax(recipeStepsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false }),
  ],
  {
    additionalProperties: Type.String()
  },
);
export type RecipeStepsQuery = Static<typeof recipeStepsQuerySchema>
export const recipeStepsQueryValidator = getValidator(recipeStepsQuerySchema, queryValidator);
export const recipeStepsQueryResolver = resolve<RecipeStepsQuery, HookContext<RecipeStepsService>>({});
