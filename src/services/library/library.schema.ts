// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema';
import type { Static } from '@feathersjs/typebox';
import { getValidator, querySyntax, Type } from '@feathersjs/typebox';

import type { HookContext } from '../../declarations';
import { dataValidator, queryValidator } from '../../validators';
import { MethodNotAllowed } from '@feathersjs/errors';
import { calledInternally } from '../../helpers/channelSecurity';

// Main data model schema
export const librarySchema = Type.Object(
  {
    id: Type.Number(),
    user: Type.String({ format: 'uuid' }),
    listId: Type.String({ format: 'uuid' }),
    list: Type.Optional(Type.Any()),
  },
  { $id: 'Library', additionalProperties: false },
);
export type Library = Static<typeof librarySchema>;
export const libraryResolver = resolve<Library, HookContext>({});

export const libraryExternalResolver = resolve<Library, HookContext>({
  id: async (value, library, ctx) => {
    if (calledInternally(ctx)) return value;
    else if (ctx.method !== 'create') return value;
    throw new MethodNotAllowed();
  },
  user: async (value, library, ctx) => {
    if (calledInternally(ctx)) return value;
    return ctx.params.user.uuid;
  },
});

// Schema for creating new entries
export const libraryDataSchema = Type.Pick(librarySchema, ['user', 'listId'], {
  $id: 'LibraryData',
});
export type LibraryData = Static<typeof libraryDataSchema>;
export const libraryDataValidator = getValidator(libraryDataSchema, dataValidator);
export const libraryDataResolver = resolve<Library, HookContext>({});

// Schema for allowed query properties
export const libraryQueryProperties = Type.Pick(librarySchema, ['id', 'user', 'listId', 'list']);
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
