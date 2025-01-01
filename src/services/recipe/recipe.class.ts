// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Id, PaginationOptions, Params } from '@feathersjs/feathers';
import type { KnexAdapterOptions, KnexAdapterParams } from '@feathersjs/knex';
import { KnexService } from '@feathersjs/knex';

import type { Application } from '../../declarations';
import type { Recipe, RecipeData, RecipePatch, RecipeQuery } from './recipe.schema';
import { app } from '../../app';
import { NotFound } from '@feathersjs/errors';

export type { Recipe, RecipeData, RecipePatch, RecipeQuery };

export interface RecipeParams extends KnexAdapterParams<RecipeQuery> {
}

type RecipeWithOwnerFlat = Recipe & {
  owner_name: string,
  owner_avatar_uri?: string,
};

type RecipeWithOwner = Recipe & {
  owner: {
    fullName: string,
    avatarURI?: string;
  }
}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class RecipeService<ServiceParams extends Params = RecipeParams> extends KnexService<
  Recipe,
  RecipeData,
  RecipeParams,
  RecipePatch
> {
  // language=PostgreSQL
  private static baseSelect = `
      SELECT recipe.id,
             title,
             description,
             "ownerId",
             u."fullName"  AS owner_name,
             u."avatarURI" AS owner_avatar_uri
      FROM recipe
  `;

  private _buildQuery(where: string = '') {
    return `
        SELECT recipe.id,
               title,
               description,
               "ownerId",
               u."fullName"  AS owner_name,
               u."avatarURI" AS owner_avatar_uri
        FROM recipe
                 LEFT JOIN users u on recipe."ownerId" = u.uuid ${where};
    `;
  }

  private _mapRecipe(recipe: RecipeWithOwnerFlat): RecipeWithOwner {
    if (!recipe) return recipe;
    return {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      ownerId: recipe.ownerId,
      owner: {
        fullName: recipe.owner_name,
        avatarURI: recipe.owner_avatar_uri,
      },
    };
  }

  async find(params?: RecipeParams & { paginate?: PaginationOptions }): Promise<any> {
    const recipes: RecipeWithOwnerFlat[] = (await app.get('postgresqlClient').raw(this._buildQuery())).rows;
    return recipes.map(this._mapRecipe);
  }

  async get(id: Id, params?: RecipeParams): Promise<Recipe> {
    const r = this._mapRecipe(
      (await app.get('postgresqlClient').raw(
        this._buildQuery(`WHERE recipe.id = ? LIMIT 1`),
        [id],
      )).rows[0],
    );

    if (!r) throw new NotFound(`Recipe with id ${id} not found`);
    return r;
  }
}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'recipe',
  };
};
