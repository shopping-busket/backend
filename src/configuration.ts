import type { Static } from '@feathersjs/typebox';
import { defaultAppConfiguration, getValidator, Type } from '@feathersjs/typebox';

import { dataValidator } from './validators';
import { SentMessageInfo, Transporter } from 'nodemailer';

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

    verifyEmails: Type.Boolean(),

    frontend: Type.Object({
      ssl: Type.Boolean(),
      host: Type.String(),
      port: Type.Number(),
    }),
  }),
]);

export type ApplicationConfiguration = Static<typeof configurationSchema> & {
  mailTransporter: Transporter<SentMessageInfo>,
  mailFrom: string,
};

export const configurationValidator = getValidator(configurationSchema, dataValidator);
