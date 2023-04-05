// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication';

import { hooks as schemaHooks } from '@feathersjs/schema';

import {
  whitelistedUsersDataValidator,
  whitelistedUsersPatchValidator,
  whitelistedUsersQueryValidator,
  whitelistedUsersResolver,
  whitelistedUsersExternalResolver,
  whitelistedUsersDataResolver,
  whitelistedUsersPatchResolver,
  whitelistedUsersQueryResolver,
} from './whitelisted-users.schema';

import type { Application } from '../../declarations';
import { WhitelistedUsersService, getOptions } from './whitelisted-users.class';
import { whitelistedUsersPath, whitelistedUsersMethods } from './whitelisted-users.shared';

export * from './whitelisted-users.class';
export * from './whitelisted-users.schema';

// A configure function that registers the service and its hooks via `app.configure`
export const whitelistedUsers = (app: Application) => {
  // Register our service on the Feathers application
  app.use(whitelistedUsersPath, new WhitelistedUsersService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: whitelistedUsersMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  });
  // Initialize hooks
  app.service(whitelistedUsersPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(whitelistedUsersExternalResolver),
        schemaHooks.resolveResult(whitelistedUsersResolver),
      ],
    },
    before: {
      all: [
        schemaHooks.validateQuery(whitelistedUsersQueryValidator),
        schemaHooks.resolveQuery(whitelistedUsersQueryResolver),
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(whitelistedUsersDataValidator),
        schemaHooks.resolveData(whitelistedUsersDataResolver),
      ],
      patch: [
        schemaHooks.validateData(whitelistedUsersPatchValidator),
        schemaHooks.resolveData(whitelistedUsersPatchResolver),
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
    [whitelistedUsersPath]: WhitelistedUsersService;
  }
}
