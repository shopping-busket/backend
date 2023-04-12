// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers';
import type { KnexAdapterOptions, KnexAdapterParams } from '@feathersjs/knex';
import { KnexService } from '@feathersjs/knex';

import type { Application } from '../../declarations';
import type {
  WhitelistedUsers,
  WhitelistedUsersData,
  WhitelistedUsersPatch,
  WhitelistedUsersQuery,
} from './whitelisted-users.schema';

export type { WhitelistedUsers, WhitelistedUsersData, WhitelistedUsersPatch, WhitelistedUsersQuery };

export interface WhitelistedUsersParams extends KnexAdapterParams<WhitelistedUsersQuery> {
}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class WhitelistedUsersService<
  ServiceParams extends Params = WhitelistedUsersParams,
> extends KnexService<
  WhitelistedUsers,
  WhitelistedUsersData,
  WhitelistedUsersParams,
  WhitelistedUsersPatch
> {
}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'whitelisted-users',
  };
};
