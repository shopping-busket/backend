// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema';

import {
  recipeDataResolver,
  recipeDataValidator,
  recipeExternalResolver,
  recipePatchResolver,
  recipePatchValidator,
  recipeQueryResolver,
  recipeQueryValidator,
  recipeResolver,
  requireRecipeOwner,
} from './recipe.schema';

import type { Application } from '../../declarations';
import { getOptions, RecipeService } from './recipe.class';
import { recipeMethods, recipePath } from './recipe.shared';

export * from './recipe.class';
export * from './recipe.schema';

// A configure function that registers the service and its hooks via `app.configure`
export const recipe = (app: Application) => {
  // Register our service on the Feathers application
  app.use(recipePath, new RecipeService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: recipeMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  });
  // Initialize hooks
  app.service(recipePath).hooks({
    around: {
      all: [schemaHooks.resolveExternal(recipeExternalResolver), schemaHooks.resolveResult(recipeResolver)],
    },
    before: {
      all: [schemaHooks.validateQuery(recipeQueryValidator), schemaHooks.resolveQuery(recipeQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(recipeDataValidator), schemaHooks.resolveData(recipeDataResolver)],
      patch: [schemaHooks.validateData(recipePatchValidator), schemaHooks.resolveData(recipePatchResolver), requireRecipeOwner],
      remove: [requireRecipeOwner],
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
    [recipePath]: RecipeService;
  }
}
