// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers';
import type { KnexAdapterOptions, KnexAdapterParams } from '@feathersjs/knex';
import { KnexService } from '@feathersjs/knex';

import type { Application } from '../../declarations';
import type { Recipe, RecipeData, RecipePatch, RecipeQuery } from './recipe.schema';

export type { Recipe, RecipeData, RecipePatch, RecipeQuery };

export interface RecipeParams extends KnexAdapterParams<RecipeQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class RecipeService<ServiceParams extends Params = RecipeParams> extends KnexService<
  Recipe,
  RecipeData,
  RecipeParams,
  RecipePatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'recipe',
  };
};
