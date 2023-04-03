// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema';
import type { Static } from '@feathersjs/typebox';
import { getValidator, querySyntax, Type } from '@feathersjs/typebox';

import type { HookContext } from '../../declarations';
import { dataValidator, queryValidator } from '../../validators';
import { randomUUID } from 'crypto';

// Main data model schema
export const shareLinkSchema = Type.Object(
  {
    id: Type.Number(),
    uri: Type.String({ format: 'uuid' }),
    pointsTo: Type.String({ format: 'uuid' }),
    users: Type.Array(Type.String({ format: 'uuid' })),
  },
  { $id: 'ShareLink', additionalProperties: false },
);
export type ShareLink = Static<typeof shareLinkSchema>;
export const shareLinkValidator = getValidator(shareLinkSchema, dataValidator);
export const shareLinkResolver = resolve<ShareLink, HookContext>({});

export const shareLinkExternalResolver = resolve<ShareLink, HookContext>({});

// Schema for creating new entries
export const shareLinkDataSchema = Type.Pick(shareLinkSchema, ['pointsTo', 'users'], {
  $id: 'ShareLinkData',
});
export type ShareLinkData = Static<typeof shareLinkDataSchema>;
export const shareLinkDataValidator = getValidator(shareLinkDataSchema, dataValidator);
export const shareLinkDataResolver = resolve<ShareLink, HookContext>({
  uri: async () => {
    return randomUUID();
  },
});

// Schema for updating existing entries
export const shareLinkPatchSchema = Type.Partial(shareLinkSchema, {
  $id: 'ShareLinkPatch',
});
export type ShareLinkPatch = Static<typeof shareLinkPatchSchema>;
export const shareLinkPatchValidator = getValidator(shareLinkPatchSchema, dataValidator);
export const shareLinkPatchResolver = resolve<ShareLink, HookContext>({});

// Schema for allowed query properties
export const shareLinkQueryProperties = Type.Pick(shareLinkSchema, ['uri', 'pointsTo']);
export const shareLinkQuerySchema = Type.Intersect(
  [
    querySyntax(shareLinkQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false }),
  ],
  { additionalProperties: false },
);
export type ShareLinkQuery = Static<typeof shareLinkQuerySchema>;
export const shareLinkQueryValidator = getValidator(shareLinkQuerySchema, queryValidator);
export const shareLinkQueryResolver = resolve<ShareLinkQuery, HookContext>({});
