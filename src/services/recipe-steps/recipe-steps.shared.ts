// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers';
import type { ClientApplication } from '../../client';
import type {
  RecipeSteps,
  RecipeStepsData,
  RecipeStepsPatch,
  RecipeStepsQuery,
  RecipeStepsService,
} from './recipe-steps.class';

export type { RecipeSteps, RecipeStepsData, RecipeStepsPatch, RecipeStepsQuery }

export type RecipeStepsClientService = Pick<
  RecipeStepsService<Params<RecipeStepsQuery>>,
  (typeof recipeStepsMethods)[number]
>

export const recipeStepsPath = 'recipe-steps'

export const recipeStepsMethods: Array<keyof RecipeStepsService> = [
  'find',
  'get',
  'create',
  'patch',
  'remove'
]

export const recipeStepsClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(recipeStepsPath, connection.service(recipeStepsPath), {
    methods: recipeStepsMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [recipeStepsPath]: RecipeStepsClientService
  }
}
