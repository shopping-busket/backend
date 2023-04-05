// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema';
import { Type, getValidator, querySyntax } from '@feathersjs/typebox';
import type { Static } from '@feathersjs/typebox';

import type { HookContext } from '../../declarations';
import { dataValidator, queryValidator } from '../../validators';
import { userSchema } from '../users/users.schema';
import { shareLinkSchema } from '../share-link/share-link.schema';

// Main data model schema
export const shareLinkUserSchema = Type.Object(
  {
    id: Type.Number(),
    user: Type.String({ format: 'uuid' }), // userSchema,
    shareLink: Type.String({ format: 'uuid' }), //shareLinkSchema,
  },
  { $id: 'ShareLinkUser', additionalProperties: false },
);
export type ShareLinkUser = Static<typeof shareLinkUserSchema>;
export const shareLinkUserValidator = getValidator(shareLinkUserSchema, dataValidator);
export const shareLinkUserResolver = resolve<ShareLinkUser, HookContext>({});

export const shareLinkUserExternalResolver = resolve<ShareLinkUser, HookContext>({});

// Schema for creating new entries
export const shareLinkUserDataSchema = Type.Pick(shareLinkUserSchema, ['user', 'shareLink'], {
  $id: 'ShareLinkUserData',
});
export type ShareLinkUserData = Static<typeof shareLinkUserDataSchema>;
export const shareLinkUserDataValidator = getValidator(shareLinkUserDataSchema, dataValidator);
export const shareLinkUserDataResolver = resolve<ShareLinkUser, HookContext>({});

// Schema for updating existing entries
export const shareLinkUserPatchSchema = Type.Partial(shareLinkUserSchema, {
  $id: 'ShareLinkUserPatch',
});
export type ShareLinkUserPatch = Static<typeof shareLinkUserPatchSchema>;
export const shareLinkUserPatchValidator = getValidator(shareLinkUserPatchSchema, dataValidator);
export const shareLinkUserPatchResolver = resolve<ShareLinkUser, HookContext>({});

// Schema for allowed query properties
export const shareLinkUserQueryProperties = Type.Pick(shareLinkUserSchema, ['id', 'user', 'shareLink']);
export const shareLinkUserQuerySchema = Type.Intersect(
  [
    querySyntax(shareLinkUserQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false }),
  ],
  { additionalProperties: false },
);
export type ShareLinkUserQuery = Static<typeof shareLinkUserQuerySchema>;
export const shareLinkUserQueryValidator = getValidator(shareLinkUserQuerySchema, queryValidator);
export const shareLinkUserQueryResolver = resolve<ShareLinkUserQuery, HookContext>({});
