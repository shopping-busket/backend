// For more information about this file see https://dove.feathersjs.com/guides/cli/client.html
import type { Application, TransportConnection } from '@feathersjs/feathers';
import { feathers } from '@feathersjs/feathers';
import type { AuthenticationClientOptions } from '@feathersjs/authentication-client';
import authenticationClient from '@feathersjs/authentication-client';

import { fileUploadClient } from './services/file-upload/file-upload.shared';

import { recipeStepsClient } from './services/recipe-steps/recipe-steps.shared';

import { ingredientsClient } from './services/ingredients/ingredients.shared';
import { recipeClient } from './services/recipe/recipe.shared';

import { verifyEmailClient } from './services/verify-email/verify-email.shared';
import { libraryClient } from './services/library/library.shared';

import { viewMailClient } from './services/view-mail/view-mail.shared';

import { whitelistedUsersClient } from './services/whitelisted-users/whitelisted-users.shared';

import { eventClient } from './services/event/event.shared';
import { listClient } from './services/list/list.shared';
import { userClient } from './services/users/users.shared';

export type {
  FileUpload,
  FileUploadSchema,
  FileUploadQuery,
  FileUploadPatch
} from './services/file-upload/file-upload.shared'

export type {
  RecipeSteps,
  RecipeStepsData,
  RecipeStepsQuery,
  RecipeStepsPatch
} from './services/recipe-steps/recipe-steps.shared'

export type {
  Ingredients,
  IngredientsData,
  IngredientsQuery,
  IngredientsPatch
} from './services/ingredients/ingredients.shared'

export type { Recipe, RecipeData, RecipeQuery, RecipePatch } from './services/recipe/recipe.shared'

export type {
  VerifyEmail,
  VerifyEmailData,
  VerifyEmailQuery
} from './services/verify-email/verify-email.shared'

export type { Library, LibraryData, LibraryQuery } from './services/library/library.shared'

export type { ViewMailInvite, ViewMailInviteQuery } from './services/view-mail/view-mail.shared'

export type {
  WhitelistedUsers,
  WhitelistedUsersData,
  WhitelistedUsersQuery,
  WhitelistedUsersPatch
} from './services/whitelisted-users/whitelisted-users.shared'

export type { Event, EventData, EventQuery, EventPatch } from './services/event/event.shared'

export type { List, ListData, ListQuery, ListPatch } from './services/list/list.shared'

export type { User, UserData, UserQuery, UserPatch } from './services/users/users.shared'

export interface Configuration {
  connection: TransportConnection<ServiceTypes>
}

export interface ServiceTypes {}

export type ClientApplication = Application<ServiceTypes, Configuration>

/**
 * Returns a typed client for the backend app.
 *
 * @param connection The REST or Socket.io Feathers client connection
 * @param authenticationOptions Additional settings for the authentication client
 * @see https://dove.feathersjs.com/api/client.html
 * @returns The Feathers client application
 */
export const createClient = <Configuration = any,>(
  connection: TransportConnection<ServiceTypes>,
  authenticationOptions: Partial<AuthenticationClientOptions> = {}
) => {
  const client: ClientApplication = feathers()

  client.configure(connection)
  client.configure(authenticationClient(authenticationOptions))
  client.set('connection', connection)

  client.configure(userClient)
  client.configure(listClient)
  client.configure(eventClient)
  client.configure(whitelistedUsersClient)
  client.configure(viewMailClient)
  client.configure(libraryClient)
  client.configure(verifyEmailClient)
  client.configure(recipeClient)
  client.configure(ingredientsClient)
  client.configure(recipeStepsClient)
  client.configure(fileUploadClient)
  return client
}
