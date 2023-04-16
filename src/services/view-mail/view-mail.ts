// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema';

import { viewMailInviteQueryValidator, viewMailVerificationQueryValidator } from './view-mail.schema';

import type { Application } from '../../declarations';
import { getOptions, ViewMailService } from './view-mail.class';
import { viewMailMethods, viewMailPath } from './view-mail.shared';
import { BadRequest } from '@feathersjs/errors';

export * from './view-mail.class';
export * from './view-mail.schema';

// A configure function that registers the service and its hooks via `app.configure`
export const viewMail = (app: Application) => {
  // Register our service on the Feathers application
  app.use(viewMailPath, new ViewMailService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: viewMailMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  });
  // Initialize hooks
  app.service(viewMailPath).hooks({
    before: {
      get: [
        async (ctx) => {
          const id = typeof ctx.id === 'string' ? parseInt(ctx.id) : ctx.id;
          if (id === undefined || Number.isNaN(id)) throw new BadRequest('id cannot be undefined/NaN');
          ctx.id = id;

          if (ctx.id === 0) return await (await schemaHooks.validateQuery(viewMailInviteQueryValidator))(ctx);
          else if (ctx.id === 1) return await (await schemaHooks.validateQuery(viewMailVerificationQueryValidator))(ctx);
        },
      ],
    },
  });
};

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [viewMailPath]: ViewMailService;
  }
}
