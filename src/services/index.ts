import { shareLink } from './share-link/share-link';
import { event } from './event/event';
import { list } from './list/list';
import { user } from './users/users';
// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html#configure-functions
import type { Application } from '../declarations';

export const services = (app: Application) => {
  app.configure(shareLink);
  app.configure(event);
  app.configure(list);
  app.configure(user);
  // All services will be registered here
};
