// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers';
import type { KnexAdapterOptions, KnexAdapterParams } from '@feathersjs/knex';
import { KnexService } from '@feathersjs/knex';

import type { Application } from '../../declarations';
import type { List, ListData, ListPatch, ListQuery } from './list.schema';

export type { List, ListData, ListPatch, ListQuery };

export interface ListParams extends KnexAdapterParams<ListQuery> {
}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class ListService<ServiceParams extends Params = ListParams> extends KnexService<
  List,
  ListData,
  ListParams,
  ListPatch
> {
}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'list',
  };
};
