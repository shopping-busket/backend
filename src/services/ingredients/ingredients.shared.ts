// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers';
import type { ClientApplication } from '../../client';
import type {
  Ingredients,
  IngredientsData,
  IngredientsPatch,
  IngredientsQuery,
  IngredientsService,
} from './ingredients.class';

export type { Ingredients, IngredientsData, IngredientsPatch, IngredientsQuery };

export type IngredientsClientService = Pick<
  IngredientsService<Params<IngredientsQuery>>,
  (typeof ingredientsMethods)[number]
>;

export const ingredientsPath = 'ingredients';

export const ingredientsMethods = ['find', 'get', 'create', 'patch', 'remove'] as const;

export const ingredientsClient = (client: ClientApplication) => {
  const connection = client.get('connection');

  client.use(ingredientsPath, connection.service(ingredientsPath), {
    methods: ingredientsMethods,
  });
};

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [ingredientsPath]: IngredientsClientService;
  }
}
