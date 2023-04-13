// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers';
import { KnexService } from '@feathersjs/knex';
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex';

import type { Application } from '../../declarations';
import type { Library, LibraryData, LibraryQuery } from './library.schema';

export type { Library, LibraryData, LibraryQuery };

export interface LibraryParams extends KnexAdapterParams<LibraryQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class LibraryService<ServiceParams extends Params = LibraryParams> extends KnexService<
  Library,
  LibraryData,
  LibraryParams
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'library',
  };
};
