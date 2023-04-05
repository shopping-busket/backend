// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication';

import { hooks as schemaHooks } from '@feathersjs/schema';

import {
  shareLinkUserDataValidator,
  shareLinkUserPatchValidator,
  shareLinkUserQueryValidator,
  shareLinkUserResolver,
  shareLinkUserExternalResolver,
  shareLinkUserDataResolver,
  shareLinkUserPatchResolver,
  shareLinkUserQueryResolver,
} from './share-link-user.schema';

import type { Application } from '../../declarations';
import { ShareLinkUserService, getOptions } from './share-link-user.class';
import { shareLinkUserPath, shareLinkUserMethods } from './share-link-user.shared';

export * from './share-link-user.class';
export * from './share-link-user.schema';

// A configure function that registers the service and its hooks via `app.configure`
export const shareLinkUser = (app: Application) => {
  // Register our service on the Feathers application
  app.use(shareLinkUserPath, new ShareLinkUserService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: shareLinkUserMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  });
  // Initialize hooks
  app.service(shareLinkUserPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(shareLinkUserExternalResolver),
        schemaHooks.resolveResult(shareLinkUserResolver),
      ],
    },
    before: {
      all: [
        schemaHooks.validateQuery(shareLinkUserQueryValidator),
        schemaHooks.resolveQuery(shareLinkUserQueryResolver),
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(shareLinkUserDataValidator),
        schemaHooks.resolveData(shareLinkUserDataResolver),
      ],
      patch: [
        schemaHooks.validateData(shareLinkUserPatchValidator),
        schemaHooks.resolveData(shareLinkUserPatchResolver),
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
    [shareLinkUserPath]: ShareLinkUserService;
  }
}
