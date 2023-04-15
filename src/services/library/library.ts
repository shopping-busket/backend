// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication';

import { hooks as schemaHooks } from '@feathersjs/schema';

import {
  Library,
  libraryDataResolver,
  libraryDataSchema,
  libraryDataValidator,
  libraryExternalResolver,
  libraryQueryResolver,
  libraryQuerySchema,
  libraryQueryValidator,
  libraryResolver,
  librarySchema,
} from './library.schema';

import type { Application } from '../../declarations';
import { getOptions, LibraryService } from './library.class';
import { libraryMethods, libraryPath } from './library.shared';
import { List } from '../list/list.schema';
import { createSwaggerServiceOptions } from 'feathers-swagger';

export * from './library.class';
export * from './library.schema';

// A configure function that registers the service and its hooks via `app.configure`
export const library = (app: Application) => {
  // Register our service on the Feathers application
  let libraryPatchSchema;
  app.use(libraryPath, new LibraryService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: libraryMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: createSwaggerServiceOptions({
      schemas: { librarySchema, libraryDataSchema, libraryPatchSchema, libraryQuerySchema },
      docs: {
        // any options for service.docs can be added here
        securities: ['all'],
        description: 'This service handles the user\'s library of lists.',

      }
    }),
  });
  // Initialize hooks
  app.service(libraryPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(libraryExternalResolver),
        schemaHooks.resolveResult(libraryResolver),
      ],
    },
    before: {
      all: [schemaHooks.validateQuery(libraryQueryValidator), schemaHooks.resolveQuery(libraryQueryResolver)],
      find: [],
      create: [schemaHooks.validateData(libraryDataValidator), schemaHooks.resolveData(libraryDataResolver)],
      remove: [],
    },
    after: {
      all: [],
      find: [async (ctx) => {
        const knex = app.get('postgresqlClient');

        for (const entry of (ctx.result as Library[])) {
          entry.list = await knex('list').select().where({
            listid: entry.listId,
          }).first() as List;
        }
      }],
    },
    error: {
      all: [],
    },
  });
};

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [libraryPath]: LibraryService;
  }
}
