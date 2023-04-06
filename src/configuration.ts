import type { Static } from '@feathersjs/typebox';
import { defaultAppConfiguration, getValidator, Type } from '@feathersjs/typebox';

import { dataValidator } from './validators';

export const configurationSchema = Type.Intersect([
  defaultAppConfiguration,
  Type.Object({
    ssl: Type.Boolean(),
    host: Type.String(),
    port: Type.Number(),
    public: Type.String(),

    mailer: Type.Object({
      host: Type.String(),
      name: Type.String(),
      address: Type.String({ format: 'email' }),
      password: Type.String(),
    }),

    frontend: Type.Object({
      ssl: Type.Boolean(),
      host: Type.String(),
      port: Type.Number(),
    }),
  }),
]);

export type ApplicationConfiguration = Static<typeof configurationSchema>

export const configurationValidator = getValidator(configurationSchema, dataValidator);
