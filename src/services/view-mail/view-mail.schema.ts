// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema';
import type { Static } from '@feathersjs/typebox';
import { getValidator, querySyntax, Type } from '@feathersjs/typebox';

import type { HookContext } from '../../declarations';
import { queryValidator } from '../../validators';

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
export const viewMailResolver = resolve<ViewMail, HookContext>({});

export const viewMailExternalResolver = resolve<ViewMail, HookContext>({});

// Schema for allowed query properties
export const viewMailQueryProperties = viewMailSchema;
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
