// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema';

import {
  recipeComponentDataResolver,
  recipeComponentDataValidator,
  recipeComponentExternalResolver,
  recipeComponentPatchResolver,
  recipeComponentPatchValidator,
  recipeComponentQueryResolver,
  recipeComponentQueryValidator,
  recipeComponentResolver,
} from './recipe-component.schema';

import type { Application } from '../../declarations';
import { getOptions, RecipeComponentService } from './recipe-component.class';
import { recipeComponentMethods, recipeComponentPath } from './recipe-component.shared';

export * from './recipe-component.class';
export * from './recipe-component.schema';

// A configure function that registers the service and its hooks via `app.configure`
export const recipeComponent = (app: Application) => {
  // Register our service on the Feathers application
  app.use(recipeComponentPath, new RecipeComponentService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: recipeComponentMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  });
  // Initialize hooks
  app.service(recipeComponentPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(recipeComponentExternalResolver),
        schemaHooks.resolveResult(recipeComponentResolver),
      ],
    },
    before: {
      all: [
        schemaHooks.validateQuery(recipeComponentQueryValidator),
        schemaHooks.resolveQuery(recipeComponentQueryResolver),
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(recipeComponentDataValidator),
        schemaHooks.resolveData(recipeComponentDataResolver),
      ],
      patch: [
        schemaHooks.validateData(recipeComponentPatchValidator),
        schemaHooks.resolveData(recipeComponentPatchResolver),
      ],
      remove: [],
    },
    after: {
      all: [],
    },
    error: {
      all: [],
    },
  });
};

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [recipeComponentPath]: RecipeComponentService;
  }
}
