// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers';
import { KnexService } from '@feathersjs/knex';
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex';

import type { Application } from '../../declarations';
import type { ShareLink, ShareLinkData, ShareLinkPatch, ShareLinkQuery } from './share-link.schema';

export type { ShareLink, ShareLinkData, ShareLinkPatch, ShareLinkQuery };

export interface ShareLinkParams extends KnexAdapterParams<ShareLinkQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class ShareLinkService<ServiceParams extends Params = ShareLinkParams> extends KnexService<
  ShareLink,
  ShareLinkData,
  ShareLinkParams,
  ShareLinkPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'share-link',
  };
};
