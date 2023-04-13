// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema';
import { Type, getValidator, querySyntax } from '@feathersjs/typebox';
import type { Static } from '@feathersjs/typebox';

import type { HookContext } from '../../declarations';
import { dataValidator, queryValidator } from '../../validators';
import { LibraryParams } from './library.class';
import { MethodNotAllowed } from '@feathersjs/errors';

// Main data model schema
export const librarySchema = Type.Object(
  {
    id: Type.Number(),
    user: Type.String({ format: 'uuid' }),
    listId: Type.String({ format: 'uuid' }),
  },
  { $id: 'Library', additionalProperties: false },
);
export type Library = Static<typeof librarySchema>;
export const libraryResolver = resolve<Library, HookContext>({});

export const libraryExternalResolver = resolve<Library, HookContext>({
  id: async (value, library, ctx) => {
    // When call is internal (from backend), allow it
    if ((ctx.params as LibraryParams).provider === undefined) return value;
    else if (ctx.method !== 'create') return value;
    throw new MethodNotAllowed();
  }
});

// Schema for creating new entries
export const libraryDataSchema = Type.Pick(librarySchema, ['user', 'listId'], {
  $id: 'LibraryData',
});
export type LibraryData = Static<typeof libraryDataSchema>;
export const libraryDataValidator = getValidator(libraryDataSchema, dataValidator);
export const libraryDataResolver = resolve<Library, HookContext>({});

// Schema for allowed query properties
export const libraryQueryProperties = Type.Pick(librarySchema, ['id', 'user', 'listId']);
export const libraryQuerySchema = Type.Intersect(
  [
    querySyntax(libraryQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false }),
  ],
  { additionalProperties: false },
);
export type LibraryQuery = Static<typeof libraryQuerySchema>;
export const libraryQueryValidator = getValidator(libraryQuerySchema, queryValidator);
export const libraryQueryResolver = resolve<LibraryQuery, HookContext>({});
