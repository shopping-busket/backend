// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication';

import { hooks as schemaHooks } from '@feathersjs/schema';

import {
  List,
  listDataResolver,
  listDataValidator,
  listExternalResolver,
  listPatchResolver,
  listPatchValidator,
  listQueryResolver,
  listQueryValidator,
  listResolver,
} from './list.schema';

import type { Application } from '../../declarations';
import { getOptions, ListService } from './list.class';
import { listMethods, listPath } from './list.shared';
import { FeathersService, Paginated } from '@feathersjs/feathers';
import { WhitelistedUsers } from '../whitelisted-users/whitelisted-users.schema';

export * from './list.class';
export * from './list.schema';

// A configure function that registers the service and its hooks via `app.configure`
export const list = (app: Application) => {
  // Register our service on the Feathers application
  app.use(listPath, new ListService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: listMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  });

  // Secure channels
  (app.service('list') as FeathersService<Application, ListService>).publish('patched', async (data: List | List[] | Paginated<List>, ctx) => {
    if (Object.prototype.hasOwnProperty.call(data, 'data')) throw new Error('Pagination not supported by publisher. have to implement');
    if (Array.isArray(data)) throw new Error('arrays not supported by publisher. have to implement');

    const knex = app.get('postgresqlClient');
    const list = data as unknown as List;

    const whitelisted = await knex('whitelisted-users').select('user').where({
      listId: list.listid,
    } as Partial<WhitelistedUsers>) as Pick<WhitelistedUsers, 'user'>[];
    const whitelistedUsers = whitelisted.map(w => w.user);

    return app.channel(app.channels).filter(conn => conn.user.uuid != null && (conn.user.uuid === list.owner || whitelistedUsers.includes(conn.user.uuid)));
  });

  // Initialize hooks
  app.service(listPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(listExternalResolver),
        schemaHooks.resolveResult(listResolver),
      ],
    },
    before: {
      all: [schemaHooks.validateQuery(listQueryValidator), schemaHooks.resolveQuery(listQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(listDataValidator), schemaHooks.resolveData(listDataResolver)],
      patch: [schemaHooks.validateData(listPatchValidator), schemaHooks.resolveData(listPatchResolver)],
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
    [listPath]: ListService;
  }
}
