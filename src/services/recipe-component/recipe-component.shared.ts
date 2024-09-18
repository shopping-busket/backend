// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers';
import type { ClientApplication } from '../../client';
import type {
  RecipeComponent,
  RecipeComponentData,
  RecipeComponentPatch,
  RecipeComponentQuery,
  RecipeComponentService,
} from './recipe-component.class';

export type { RecipeComponent, RecipeComponentData, RecipeComponentPatch, RecipeComponentQuery };

export type RecipeComponentClientService = Pick<
  RecipeComponentService<Params<RecipeComponentQuery>>,
  (typeof recipeComponentMethods)[number]
>;

export const recipeComponentPath = 'recipe-component';

export const recipeComponentMethods = ['find', 'get', 'create', 'patch', 'remove'] as const;

export const recipeComponentClient = (client: ClientApplication) => {
  const connection = client.get('connection');

  client.use(recipeComponentPath, connection.service(recipeComponentPath), {
    methods: recipeComponentMethods,
  });
};

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [recipeComponentPath]: RecipeComponentClientService;
  }
}
