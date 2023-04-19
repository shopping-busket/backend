// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import crypto, { randomUUID } from 'crypto';
import { resolve } from '@feathersjs/schema';
import type { Static } from '@feathersjs/typebox';
import { getValidator, querySyntax, Type } from '@feathersjs/typebox';
import { passwordHash } from '@feathersjs/authentication-local';

import type { HookContext } from '../../declarations';
import { dataValidator, queryValidator } from '../../validators';
import { onlyAllowInternalValue } from '../../helpers/channelSecurity';
import { app } from '../../app';

// Main data model schema
export const userSchema = Type.Object(
  {
    id: Type.Number(),
    uuid: Type.String({ format: 'uuid' }),

    email: Type.String({ format: 'email' }),
    password: Type.String(),

    fullName: Type.String(),
    avatarURI: Type.String(),

    preferredLanguage: Type.Optional(Type.String({ default: 'en' })),
    prefersDarkMode: Type.Optional(Type.Boolean({ default: false })),
    prefersMiniDrawer: Type.Optional(Type.Boolean({ default: false })),

    googleId: Type.Optional(Type.String()),
    githubId: Type.Optional(Type.String()),

    verifiedEmail: Type.Optional(Type.Boolean()),
  },
  { $id: 'User', additionalProperties: false },
);
export type User = Static<typeof userSchema>
export const userValidator = getValidator(userSchema, dataValidator);
export const userResolver = resolve<User, HookContext>({});

export const userExternalResolver = resolve<User, HookContext>({
  // The password should never be visible externally
  password: async () => undefined,
});

// Schema for creating new entries
export const userDataSchema = Type.Pick(
  userSchema,
  [
    'email',
    'password',
    'fullName',
    'preferredLanguage',
    'prefersDarkMode',
    'prefersMiniDrawer',
    'googleId',
    'githubId',
  ]
  , {
    $id: 'UserData',
  });
export type UserData = Static<typeof userDataSchema>
export const userDataValidator = getValidator(userDataSchema, dataValidator);
export const userDataResolver = resolve<User, HookContext>({
  password: passwordHash({ strategy: 'local' }),
  uuid: async () => randomUUID(),
  fullName: async (value) => {
    if (value && value.length > 0) return value;
  },
  avatarURI: async (value, user) => {
    // If the user passed an avatar image, use it
    if (value !== undefined) {
      return value;
    }

    // Gravatar uses MD5 hashes from an email address to get the image
    const hash = crypto.createHash('md5').update(user.email.toLowerCase()).digest('hex');
    // Return the full avatar URL
    return `https://gravatar.com/avatar/${hash}?s=60&d=monsterid`;
  },
  verifiedEmail: async (value, users, ctx) => {
    if (!app.get('verifyEmails')) return true;
    return onlyAllowInternalValue<boolean | undefined>(value, users, ctx);
  },
});

// Schema for updating existing entries
export const userPatchSchema = Type.Partial(userSchema, {
  $id: 'UserPatch',
});
export type UserPatch = Static<typeof userPatchSchema>
export const userPatchValidator = getValidator(userPatchSchema, dataValidator);
export const userPatchResolver = resolve<User, HookContext>({
  password: passwordHash({ strategy: 'local' }),
  verifiedEmail: onlyAllowInternalValue<boolean | undefined>,
});

// Schema for allowed query properties
export const userQueryProperties = Type.Pick(userSchema, ['uuid', 'id', 'email', 'googleId', 'githubId']);
export const userQuerySchema = Type.Intersect(
  [
    querySyntax(userQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false }),
  ],
  { additionalProperties: false },
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
  },
});
