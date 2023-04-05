// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema';
import { Type, getValidator, querySyntax } from '@feathersjs/typebox';
import type { Static } from '@feathersjs/typebox';

import type { HookContext } from '../../declarations';
import { dataValidator, queryValidator } from '../../validators';

// Main data model schema
export const whitelistedUsersSchema = Type.Object(
  {
    id: Type.Number(),
    text: Type.String(),
  },
  { $id: 'WhitelistedUsers', additionalProperties: false },
);
export type WhitelistedUsers = Static<typeof whitelistedUsersSchema>;
export const whitelistedUsersValidator = getValidator(whitelistedUsersSchema, dataValidator);
export const whitelistedUsersResolver = resolve<WhitelistedUsers, HookContext>({});

export const whitelistedUsersExternalResolver = resolve<WhitelistedUsers, HookContext>({});

// Schema for creating new entries
export const whitelistedUsersDataSchema = Type.Pick(whitelistedUsersSchema, ['text'], {
  $id: 'WhitelistedUsersData',
});
export type WhitelistedUsersData = Static<typeof whitelistedUsersDataSchema>;
export const whitelistedUsersDataValidator = getValidator(whitelistedUsersDataSchema, dataValidator);
export const whitelistedUsersDataResolver = resolve<WhitelistedUsers, HookContext>({});

// Schema for updating existing entries
export const whitelistedUsersPatchSchema = Type.Partial(whitelistedUsersSchema, {
  $id: 'WhitelistedUsersPatch',
});
export type WhitelistedUsersPatch = Static<typeof whitelistedUsersPatchSchema>;
export const whitelistedUsersPatchValidator = getValidator(whitelistedUsersPatchSchema, dataValidator);
export const whitelistedUsersPatchResolver = resolve<WhitelistedUsers, HookContext>({});

// Schema for allowed query properties
export const whitelistedUsersQueryProperties = Type.Pick(whitelistedUsersSchema, ['id', 'text']);
export const whitelistedUsersQuerySchema = Type.Intersect(
  [
    querySyntax(whitelistedUsersQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false }),
  ],
  { additionalProperties: false },
);
export type WhitelistedUsersQuery = Static<typeof whitelistedUsersQuerySchema>;
export const whitelistedUsersQueryValidator = getValidator(whitelistedUsersQuerySchema, queryValidator);
export const whitelistedUsersQueryResolver = resolve<WhitelistedUsersQuery, HookContext>({});
