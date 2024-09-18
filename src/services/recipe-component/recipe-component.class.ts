// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers';
import type { KnexAdapterOptions, KnexAdapterParams } from '@feathersjs/knex';
import { KnexService } from '@feathersjs/knex';

import type { Application } from '../../declarations';
import type {
  RecipeComponent,
  RecipeComponentData,
  RecipeComponentPatch,
  RecipeComponentQuery,
} from './recipe-component.schema';

export type { RecipeComponent, RecipeComponentData, RecipeComponentPatch, RecipeComponentQuery };

export interface RecipeComponentParams extends KnexAdapterParams<RecipeComponentQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class RecipeComponentService<ServiceParams extends Params = RecipeComponentParams> extends KnexService<
  RecipeComponent,
  RecipeComponentData,
  RecipeComponentParams,
  RecipeComponentPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'recipe-component',
  };
};
