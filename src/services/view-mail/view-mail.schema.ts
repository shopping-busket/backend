// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox';
import { getValidator, Type } from '@feathersjs/typebox';

import { queryValidator } from '../../validators';

// Main data model schema
export const viewMailInviteSchema = Type.Object(
  {
    listId: Type.String({ format: 'uuid' }),
    listName: Type.String(),
    ownerName: Type.String(),
    joinURL: Type.String(),
    bannerImgURL: Type.String(),
    $select: Type.Optional(Type.Any()),
  },
  { $id: 'ViewMailInvite', additionalProperties: false },
);

export const viewMailVerificationSchema = Type.Object(
  {
      verifyURL: Type.String(),
      bannerImgURL: Type.String(),
      $select: Type.Optional(Type.Any()),
  },
  { $id: 'ViewMailVerification', additionalProperties: false },
);


export type ViewMailInvite = Static<typeof viewMailInviteSchema>;
export type ViewMailVerification = Static<typeof viewMailVerificationSchema>;

// Schema for allowed query properties
export type ViewMailInviteQuery = ViewMailInvite;
export type ViewMailVerificationQuery = ViewMailVerification;
export const viewMailInviteQueryValidator = getValidator(viewMailInviteSchema, queryValidator);
export const viewMailVerificationQueryValidator = getValidator(viewMailVerificationSchema, queryValidator);
