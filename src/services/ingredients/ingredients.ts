// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema';

import {
  ingredientsDataResolver,
  ingredientsDataValidator,
  ingredientsExternalResolver,
  ingredientsPatchResolver,
  ingredientsPatchValidator,
  ingredientsQueryResolver,
  ingredientsQueryValidator,
  ingredientsResolver,
} from './ingredients.schema';

import type { Application } from '../../declarations';
import { getOptions, IngredientsService } from './ingredients.class';
import { ingredientsMethods, ingredientsPath } from './ingredients.shared';

export * from './ingredients.class';
export * from './ingredients.schema';

// A configure function that registers the service and its hooks via `app.configure`
export const ingredients = (app: Application) => {
  // Register our service on the Feathers application
  app.use(ingredientsPath, new IngredientsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: ingredientsMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  });
  // Initialize hooks
  app.service(ingredientsPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(ingredientsExternalResolver),
        schemaHooks.resolveResult(ingredientsResolver),
      ],
    },
    before: {
      all: [
        schemaHooks.validateQuery(ingredientsQueryValidator),
        schemaHooks.resolveQuery(ingredientsQueryResolver),
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(ingredientsDataValidator),
        schemaHooks.resolveData(ingredientsDataResolver),
      ],
      patch: [
        schemaHooks.validateData(ingredientsPatchValidator),
        schemaHooks.resolveData(ingredientsPatchResolver),
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
    [ingredientsPath]: IngredientsService;
  }
}
