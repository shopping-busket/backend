// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema';
import type { Static } from '@feathersjs/typebox';
import { getValidator, querySyntax, Type } from '@feathersjs/typebox';

import type { HookContext } from '../../declarations';
import { dataValidator, queryValidator } from '../../validators';
import { onlyAllowInternal } from '../../helpers/channelSecurity';

// Main data model schema
export const verifyEmailSchema = Type.Object(
  {
    id: Type.Number(),
    user: Type.String({ format: 'uuid' }),
    verifySecret: Type.String({ format: 'uuid' }),
  },
  { $id: 'VerifyEmail', additionalProperties: false },
);
export type VerifyEmail = Static<typeof verifyEmailSchema>;
export const verifyEmailValidator = getValidator(verifyEmailSchema, dataValidator);
export const verifyEmailResolver = resolve<VerifyEmail, HookContext>({});

export const verifyEmailExternalResolver = resolve<VerifyEmail, HookContext>({});

// Schema for creating new entries
export const verifyEmailDataSchema = Type.Pick(verifyEmailSchema, ['user', 'verifySecret'], {
  $id: 'VerifyEmailData',
});
export type VerifyEmailData = Static<typeof verifyEmailDataSchema>;
export const verifyEmailDataValidator = getValidator(verifyEmailDataSchema, dataValidator);
export const verifyEmailDataResolver = resolve<VerifyEmail, HookContext>({});

// Schema for updating existing entries
export const verifyEmailPatchSchema = Type.Partial(verifyEmailSchema, {
  $id: 'VerifyEmailPatch',
});
export type VerifyEmailPatch = Static<typeof verifyEmailPatchSchema>;
export const verifyEmailPatchValidator = getValidator(verifyEmailPatchSchema, dataValidator);
export const verifyEmailPatchResolver = resolve<VerifyEmail, HookContext>({});

// Schema for allowed query properties
export const verifyEmailQueryProperties = Type.Pick(verifyEmailSchema, ['id', 'user', 'verifySecret']);
export const verifyEmailQuerySchema = Type.Intersect(
  [
    querySyntax(verifyEmailQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false }),
  ],
  { additionalProperties: false },
);
export type VerifyEmailQuery = Static<typeof verifyEmailQuerySchema>;
export const verifyEmailQueryValidator = getValidator(verifyEmailQuerySchema, queryValidator);
export const verifyEmailQueryResolver = resolve<VerifyEmailQuery, HookContext>({
  id: onlyAllowInternal,
  user: onlyAllowInternal,
  verifySecret: onlyAllowInternal,
});