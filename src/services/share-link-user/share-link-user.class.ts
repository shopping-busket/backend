// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers';
import { KnexService } from '@feathersjs/knex';
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex';

import type { Application } from '../../declarations';
import type {
  ShareLinkUser,
  ShareLinkUserData,
  ShareLinkUserPatch,
  ShareLinkUserQuery,
} from './share-link-user.schema';

export type { ShareLinkUser, ShareLinkUserData, ShareLinkUserPatch, ShareLinkUserQuery };

export interface ShareLinkUserParams extends KnexAdapterParams<ShareLinkUserQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class ShareLinkUserService<ServiceParams extends Params = ShareLinkUserParams> extends KnexService<
  ShareLinkUser,
  ShareLinkUserData,
  ShareLinkUserParams,
  ShareLinkUserPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'share-link-user',
  };
};
