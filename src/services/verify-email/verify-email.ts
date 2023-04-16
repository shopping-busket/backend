// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { hooks as schemaHooks } from '@feathersjs/schema';

import {
  verifyEmailDataResolver,
  verifyEmailDataValidator,
  verifyEmailPatchResolver,
  verifyEmailPatchValidator,
  verifyEmailQueryResolver,
  verifyEmailQueryValidator,
  verifyEmailResolver,
} from './verify-email.schema';

import type { Application } from '../../declarations';
import { getOptions, VerifyEmailService } from './verify-email.class';
import { verifyEmailMethods, verifyEmailPath } from './verify-email.shared';

export * from './verify-email.class';
export * from './verify-email.schema';

// A configure function that registers the service and its hooks via `app.configure`
export const verifyEmail = (app: Application) => {
  // Register our service on the Feathers application
  app.use(verifyEmailPath, new VerifyEmailService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: verifyEmailMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  });
  // Initialize hooks
  app.service(verifyEmailPath).hooks({
    around: {
      all: [
        // authenticate('jwt'),
        schemaHooks.resolveResult(verifyEmailResolver),
      ],
    },
    before: {
      all: [
        schemaHooks.validateQuery(verifyEmailQueryValidator),
        schemaHooks.resolveQuery(verifyEmailQueryResolver),
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(verifyEmailDataValidator),
        schemaHooks.resolveData(verifyEmailDataResolver),
      ],
      patch: [
        schemaHooks.validateData(verifyEmailPatchValidator),
        schemaHooks.resolveData(verifyEmailPatchResolver),
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
    [verifyEmailPath]: VerifyEmailService;
  }
}
