// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema';
import type { Static } from '@feathersjs/typebox';
import { getValidator, querySyntax, Type } from '@feathersjs/typebox';

import type { HookContext } from '../../declarations';
import { dataValidator, queryValidator } from '../../validators';
import { omitMethodsFromRule, onlyAllowInternal } from '../../helpers/channelSecurity';
import { randomUUID } from 'crypto';

// Main data model schema
export const verifyEmailSchema = Type.Object(
  {
    id: Type.Number(),
    user: Type.String({ format: 'uuid' }),
    verifySecret: Type.String({ format: 'uuid' }),
    expiresAt: Type.String({ format: 'date-time' }),
  },
  { $id: 'VerifyEmail', additionalProperties: false },
);
export type VerifyEmail = Static<typeof verifyEmailSchema>;
export const verifyEmailResolver = resolve<VerifyEmail, HookContext>({});

// Schema for creating new entries
export const verifyEmailDataSchema = Type.Pick(verifyEmailSchema, ['user'], {
  $id: 'VerifyEmailData',
});
export type VerifyEmailData = Static<typeof verifyEmailDataSchema>;
export const verifyEmailDataValidator = getValidator(verifyEmailDataSchema, dataValidator);
export const verifyEmailDataResolver = resolve<VerifyEmail, HookContext>({
  verifySecret: async () => randomUUID(),
  expiresAt: async () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 15);
    return date.toISOString();
  },
});

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
  id: async (value, verifyEmail, ctx) => omitMethodsFromRule(value, verifyEmail, ctx, onlyAllowInternal, ['get']),
});
