// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema';

import {
  recipeStepsDataResolver,
  recipeStepsDataValidator,
  recipeStepsExternalResolver,
  recipeStepsPatchResolver,
  recipeStepsPatchValidator,
  recipeStepsQueryResolver,
  recipeStepsQueryValidator,
  recipeStepsResolver,
} from './recipe-steps.schema';

import type { Application } from '../../declarations';
import { getOptions, RecipeStepsService } from './recipe-steps.class';
import { recipeStepsMethods, recipeStepsPath } from './recipe-steps.shared';

export * from './recipe-steps.class'
export * from './recipe-steps.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const recipeSteps = (app: Application) => {
  // Register our service on the Feathers application
  app.use(recipeStepsPath, new RecipeStepsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: recipeStepsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(recipeStepsPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(recipeStepsExternalResolver),
        schemaHooks.resolveResult(recipeStepsResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(recipeStepsQueryValidator),
        schemaHooks.resolveQuery(recipeStepsQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(recipeStepsDataValidator),
        schemaHooks.resolveData(recipeStepsDataResolver)
      ],
      patch: [
        schemaHooks.validateData(recipeStepsPatchValidator),
        schemaHooks.resolveData(recipeStepsPatchResolver)
      ],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [recipeStepsPath]: RecipeStepsService
  }
}
