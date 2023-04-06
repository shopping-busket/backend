// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema';
import type { Static } from '@feathersjs/typebox';
import { getValidator, querySyntax, Type } from '@feathersjs/typebox';

import type { HookContext } from '../../declarations';
import { dataValidator, queryValidator } from '../../validators';

// Main data model schema
export const viewMailSchema = Type.Object(
  {
    listId: Type.String({ format: 'uuid' }),
    listName: Type.String(),
    ownerName: Type.String(),
    joinURL: Type.String(),
    bannerImgURL: Type.String(),
  },
  { $id: 'ViewMail', additionalProperties: false },
);
export type ViewMail = Static<typeof viewMailSchema>;
export const viewMailValidator = getValidator(viewMailSchema, dataValidator);
export const viewMailResolver = resolve<ViewMail, HookContext>({});

export const viewMailExternalResolver = resolve<ViewMail, HookContext>({});

// Schema for creating new entries
export const viewMailDataSchema = Type.Pick(viewMailSchema, [], {
  $id: 'ViewMailData',
});
export type ViewMailData = Static<typeof viewMailDataSchema>;
export const viewMailDataValidator = getValidator(viewMailDataSchema, dataValidator);
export const viewMailDataResolver = resolve<ViewMail, HookContext>({});

// Schema for updating existing entries
export const viewMailPatchSchema = Type.Partial(viewMailSchema, {
  $id: 'ViewMailPatch',
});
export type ViewMailPatch = Static<typeof viewMailPatchSchema>;
export const viewMailPatchValidator = getValidator(viewMailPatchSchema, dataValidator);
export const viewMailPatchResolver = resolve<ViewMail, HookContext>({});

// Schema for allowed query properties
export const viewMailQueryProperties = Type.Pick(viewMailSchema, ['listId', 'listName', 'ownerName', 'joinURL', 'bannerImgURL']);
export const viewMailQuerySchema = Type.Intersect(
  [
    querySyntax(viewMailQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false }),
  ],
  { additionalProperties: false },
);
export type ViewMailQuery = Static<typeof viewMailQuerySchema>;
export const viewMailQueryValidator = getValidator(viewMailQuerySchema, queryValidator);
export const viewMailQueryResolver = resolve<ViewMailQuery, HookContext>({});
