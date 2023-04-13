// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema';
import { Type, getValidator, querySyntax } from '@feathersjs/typebox';
import type { Static } from '@feathersjs/typebox';

import type { HookContext } from '../../declarations';
import { dataValidator, queryValidator } from '../../validators';

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
export const libraryValidator = getValidator(librarySchema, dataValidator);
export const libraryResolver = resolve<Library, HookContext>({});

export const libraryExternalResolver = resolve<Library, HookContext>({});

// Schema for creating new entries
export const libraryDataSchema = Type.Pick(librarySchema, ['user', 'listId'], {
  $id: 'LibraryData',
});
export type LibraryData = Static<typeof libraryDataSchema>;
export const libraryDataValidator = getValidator(libraryDataSchema, dataValidator);
export const libraryDataResolver = resolve<Library, HookContext>({});

// Schema for updating existing entries
export const libraryPatchSchema = Type.Partial(librarySchema, {
  $id: 'LibraryPatch',
});
export type LibraryPatch = Static<typeof libraryPatchSchema>;
export const libraryPatchValidator = getValidator(libraryPatchSchema, dataValidator);
export const libraryPatchResolver = resolve<Library, HookContext>({});

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
