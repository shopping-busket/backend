// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication';

import { hooks as schemaHooks } from '@feathersjs/schema';

import {
  listDataResolver,
  listDataValidator,
  listExternalResolver,
  listPatchResolver,
  listPatchValidator,
  listQueryResolver,
  listQueryValidator,
  listResolver,
} from './list.schema';

import type { Application, HookContext } from '../../declarations';
import { getOptions, ListService } from './list.class';
import { listMethods, listPath } from './list.shared';
import { onlyAllowWhitelistedOrOwner, requireDataToBeObject } from '../../helpers/channelSecurity';
import { addToLibrary } from '../../helpers/libraryHelper';
import { ServerInternalItems, ServerInternalList } from '../event/eventReceiver-fix2';
import _ from 'lodash';

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
  app.service(listPath).publish('patched', onlyAllowWhitelistedOrOwner);

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
      all: [async (ctx: HookContext<ListService>) => {
        const result: ServerInternalList[] = (Array.isArray(ctx.result) ? ctx.result : [ctx.result]) as unknown as ServerInternalList[];
        ctx.result = result.map(r => {
          if (r.entries && (r.entries as ServerInternalItems).items) r.entries = (r.entries as ServerInternalItems).items;
          if (r.checkedEntries && (r.checkedEntries as ServerInternalItems).items) r.checkedEntries = (r.checkedEntries as ServerInternalItems).items;
          return r;
        });
        return ctx;
      }],
      create: [async (ctx: HookContext<ListService>) => {
        const data = _.castArray(ctx.result);
        await Promise.all(data.map(d => addToLibrary(requireDataToBeObject(d)?.owner ?? 'Error', requireDataToBeObject(d)?.listid ?? 'Error')));
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
    [listPath]: ListService;
  }
}
