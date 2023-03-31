// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  listDataValidator,
  listPatchValidator,
  listQueryValidator,
  listResolver,
  listExternalResolver,
  listDataResolver,
  listPatchResolver,
  listQueryResolver
} from './list.schema'

import type { Application } from '../../declarations'
import { ListService, getOptions } from './list.class'
import { listPath, listMethods } from './list.shared'

export * from './list.class'
export * from './list.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const list = (app: Application) => {
  // Register our service on the Feathers application
  app.use(listPath, new ListService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: listMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(listPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(listExternalResolver),
        schemaHooks.resolveResult(listResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(listQueryValidator), schemaHooks.resolveQuery(listQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(listDataValidator), schemaHooks.resolveData(listDataResolver)],
      patch: [schemaHooks.validateData(listPatchValidator), schemaHooks.resolveData(listPatchResolver)],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [listPath]: ListService
  }
}
