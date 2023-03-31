// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema';
import { Type, getValidator, querySyntax } from '@feathersjs/typebox';
import type { Static } from '@feathersjs/typebox';
import { passwordHash } from '@feathersjs/authentication-local';

import type { HookContext } from '../../declarations';
import { dataValidator, queryValidator } from '../../validators';

// Main data model schema
export const userSchema = Type.Object(
  {
    createdAt: Type.Optional(Type.Date()),
    updatedAt: Type.Optional(Type.Date()),

    id: Type.Number(),
    uuid: Type.String(),

    email: Type.String(),
    password: Type.Optional(Type.String()),

    fullName: Type.Optional(Type.String()),
    avatarURI: Type.Optional(Type.String()),

    preferredLanguage: Type.Optional(Type.String({ default: 'en' })),
    prefersDarkMode: Type.Optional(Type.Boolean({ default: false })),
    prefersMiniDrawer: Type.Optional(Type.Boolean({ default: false })),

    googleId: Type.String(),
    githubId: Type.String(),
  },
  { $id: 'User', additionalProperties: false }
);
export type User = Static<typeof userSchema>
export const userValidator = getValidator(userSchema, dataValidator);
export const userResolver = resolve<User, HookContext>({});

export const userExternalResolver = resolve<User, HookContext>({
  // The password should never be visible externally
  password: async () => undefined
});

// Schema for creating new entries
export const userDataSchema = Type.Pick(userSchema, ['createdAt', 'updatedAt', 'email', 'password', 'fullName', 'avatarURI', 'prefersDarkMode', 'preferredLanguage', 'prefersMiniDrawer', 'uuid', 'googleId', 'githubId'], {
  $id: 'UserData'
});
export type UserData = Static<typeof userDataSchema>
export const userDataValidator = getValidator(userDataSchema, dataValidator);
export const userDataResolver = resolve<User, HookContext>({
  password: passwordHash({ strategy: 'local' })
});

// Schema for updating existing entries
export const userPatchSchema = Type.Partial(userSchema, {
  $id: 'UserPatch'
});
export type UserPatch = Static<typeof userPatchSchema>
export const userPatchValidator = getValidator(userPatchSchema, dataValidator);
export const userPatchResolver = resolve<User, HookContext>({
  password: passwordHash({ strategy: 'local' })
});

// Schema for allowed query properties
export const userQueryProperties = Type.Pick(userSchema, ['id', 'email']);
export const userQuerySchema = Type.Intersect(
  [
    querySyntax(userQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
);
export type UserQuery = Static<typeof userQuerySchema>
export const userQueryValidator = getValidator(userQuerySchema, queryValidator);
export const userQueryResolver = resolve<UserQuery, HookContext>({
  // If there is a user (e.g. with authentication), they are only allowed to see their own data
  id: async (value, user, context) => {
    if (context.params.user) {
      return context.params.user.id;
    }

    return value;
  }
});
