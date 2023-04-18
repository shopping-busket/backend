// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication';

import { hooks as schemaHooks } from '@feathersjs/schema';

import {
  User,
  userDataResolver,
  userDataValidator,
  userExternalResolver,
  userPatchResolver,
  userPatchValidator,
  userQueryResolver,
  userQueryValidator,
  userResolver,
} from './users.schema';

import type { Application, HookContext } from '../../declarations';
import { getOptions, UserService } from './users.class';
import { userMethods, userPath } from './users.shared';
import { verifyEmailPath } from '../verify-email/verify-email.shared';

export * from './users.class';
export * from './users.schema';

// A configure function that registers the service and its hooks via `app.configure`
export const user = (app: Application) => {
  // Register our service on the Feathers application
  app.use(userPath, new UserService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: userMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  });
  // Initialize hooks
  app.service(userPath).hooks({
    around: {
      all: [schemaHooks.resolveExternal(userExternalResolver), schemaHooks.resolveResult(userResolver)],
      find: [authenticate('jwt')],
      get: [authenticate('jwt')],
      create: [],
      update: [authenticate('jwt')],
      patch: [authenticate('jwt')],
      remove: [authenticate('jwt')],
    },
    before: {
      all: [schemaHooks.validateQuery(userQueryValidator), schemaHooks.resolveQuery(userQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(userDataValidator), schemaHooks.resolveData(userDataResolver)],
      patch: [schemaHooks.validateData(userPatchValidator), schemaHooks.resolveData(userPatchResolver)],
      remove: [],
    },
    after: {
      all: [],
      create: [
        async (ctx: HookContext): Promise<void> => {
          const user = ctx.result as User;
          if (!user) throw new Error('no ctx.result in user.hooks.after.create');
          if (!user.uuid) throw new Error('user has no uuid in user.hooks.after.create');
          if (!app.get('verifyEmails')) return;

          await app.service(verifyEmailPath).create({
            user: user.uuid,
          });
        },
      ],
    },
    error: {
      all: [],
    },
  });
};

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [userPath]: UserService;
  }
}
