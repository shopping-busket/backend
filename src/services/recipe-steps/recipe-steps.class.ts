// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers';
import type { KnexAdapterOptions, KnexAdapterParams } from '@feathersjs/knex';
import { KnexService } from '@feathersjs/knex';

import type { Application } from '../../declarations';
import type { RecipeSteps, RecipeStepsData, RecipeStepsPatch, RecipeStepsQuery } from './recipe-steps.schema';

export type { RecipeSteps, RecipeStepsData, RecipeStepsPatch, RecipeStepsQuery }

export interface RecipeStepsParams extends KnexAdapterParams<RecipeStepsQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class RecipeStepsService<ServiceParams extends Params = RecipeStepsParams> extends KnexService<
  RecipeSteps,
  RecipeStepsData,
  RecipeStepsParams,
  RecipeStepsPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'recipe-steps'
  }
}
