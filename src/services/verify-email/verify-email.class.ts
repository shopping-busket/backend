// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers';
import type { KnexAdapterOptions, KnexAdapterParams } from '@feathersjs/knex';
import { KnexService } from '@feathersjs/knex';

import type { Application } from '../../declarations';
import type { VerifyEmail, VerifyEmailData, VerifyEmailPatch, VerifyEmailQuery } from './verify-email.schema';

export type { VerifyEmail, VerifyEmailData, VerifyEmailPatch, VerifyEmailQuery };

export interface VerifyEmailParams extends KnexAdapterParams<VerifyEmailQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class VerifyEmailService<ServiceParams extends Params = VerifyEmailParams> extends KnexService<
  VerifyEmail,
  VerifyEmailData,
  VerifyEmailParams,
  VerifyEmailPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'verify-email',
  };
};
