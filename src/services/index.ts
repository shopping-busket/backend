import { recipeSteps } from './recipe-steps/recipe-steps';
import { ingredients } from './ingredients/ingredients';
import { recipe } from './recipe/recipe';
import { verifyEmail } from './verify-email/verify-email';
import { library } from './library/library';
import { viewMail } from './view-mail/view-mail';
import { whitelistedUsers } from './whitelisted-users/whitelisted-users';
import { event } from './event/event';
import { list } from './list/list';
import { user } from './users/users';
// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html#configure-functions
import type { Application } from '../declarations';

export const services = (app: Application) => {
  app.configure(recipeSteps)
  app.configure(ingredients)
  app.configure(recipe)
  app.configure(verifyEmail)
  app.configure(library)
  app.configure(viewMail)
  app.configure(whitelistedUsers)
  app.configure(event)
  app.configure(list)
  app.configure(user)
  // All services will be registered here
}
