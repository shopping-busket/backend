// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication';

import { hooks as schemaHooks } from '@feathersjs/schema';

import {
  shareLinkDataValidator,
  shareLinkPatchValidator,
  shareLinkQueryValidator,
  shareLinkResolver,
  shareLinkExternalResolver,
  shareLinkDataResolver,
  shareLinkPatchResolver,
  shareLinkQueryResolver,
} from './share-link.schema';

import type { Application } from '../../declarations';
import { ShareLinkService, getOptions } from './share-link.class';
import { shareLinkPath, shareLinkMethods } from './share-link.shared';

export * from './share-link.class';
export * from './share-link.schema';

// A configure function that registers the service and its hooks via `app.configure`
export const shareLink = (app: Application) => {
  // Register our service on the Feathers application
  app.use(shareLinkPath, new ShareLinkService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: shareLinkMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  });
  // Initialize hooks
  app.service(shareLinkPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(shareLinkExternalResolver),
        schemaHooks.resolveResult(shareLinkResolver),
      ],
    },
    before: {
      all: [
        schemaHooks.validateQuery(shareLinkQueryValidator),
        schemaHooks.resolveQuery(shareLinkQueryResolver),
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(shareLinkDataValidator),
        schemaHooks.resolveData(shareLinkDataResolver),
      ],
      patch: [
        schemaHooks.validateData(shareLinkPatchValidator),
        schemaHooks.resolveData(shareLinkPatchResolver),
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
    [shareLinkPath]: ShareLinkService;
  }
}
