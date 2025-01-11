// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema';

import {
  Ingredients,
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
import { requireRecipeOwner } from '../recipe/recipe.schema';
import { BadRequest } from '@feathersjs/errors';
import _ from 'lodash';

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
        async (ctx) => requireRecipeOwner(ctx, (ctx.data as Ingredients).recipeId),
      ],
      patch: [
        schemaHooks.validateData(ingredientsPatchValidator),
        schemaHooks.resolveData(ingredientsPatchResolver),
        async (ctx) => {
          return requireRecipeOwner(ctx, (await app.service('ingredients').get(ctx.id!)).recipeId);
        },
      ],
      remove: [
        async (ctx) => {
          if (ctx.id) return requireRecipeOwner(ctx, (await app.service('ingredients').get(ctx.id!)).recipeId);
          if (typeof ctx.params.query?.id !== 'number' && Array.isArray(ctx.params.query?.id?.$in)) {
            const ingredientsWithId = ctx.params.query.id.$in;
            ctx.params.query = _(ctx.params.query).pick('id.$in').value();
            if (ingredientsWithId.length <= 0) return ctx;

            const recipeIds: number[] = await app.get('postgresqlClient').raw(`
                SELECT "recipeId"
                FROM "ingredients"
                WHERE ingredients."recipeId" in (${ingredientsWithId.map(_ => '?').join(',')})
            `, [...ingredientsWithId]);

            for (let id of _.uniq(recipeIds)) await requireRecipeOwner(ctx, id);

            return ctx;
          }
          throw new BadRequest('removes on multiple ingredients may only be written using query.id.$in!');
        },
      ],
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
