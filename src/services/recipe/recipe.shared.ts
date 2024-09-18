// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers';
import type { ClientApplication } from '../../client';
import type { Recipe, RecipeData, RecipePatch, RecipeQuery, RecipeService } from './recipe.class';

export type { Recipe, RecipeData, RecipePatch, RecipeQuery };

export type RecipeClientService = Pick<RecipeService<Params<RecipeQuery>>, (typeof recipeMethods)[number]>;

export const recipePath = 'recipe';

export const recipeMethods = ['find', 'get', 'create', 'patch', 'remove'] as const;

export const recipeClient = (client: ClientApplication) => {
  const connection = client.get('connection');

  client.use(recipePath, connection.service(recipePath), {
    methods: recipeMethods,
  });
};

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [recipePath]: RecipeClientService;
  }
}
