// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema';
import type { Static } from '@feathersjs/typebox';
import { getValidator, Type } from '@feathersjs/typebox';

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
    $select: Type.Optional(Type.Any()),
  },
  { $id: 'ViewMail', additionalProperties: false },
);
export type ViewMail = Static<typeof viewMailSchema>;
export const viewMailResolver = resolve<ViewMail, HookContext>({});

// Schema for allowed query properties
export type ViewMailQuery = Static<typeof viewMailSchema>;
export const viewMailQueryValidator = getValidator(viewMailSchema, queryValidator);
export const viewMailQueryResolver = resolve<ViewMailQuery, HookContext>({});
