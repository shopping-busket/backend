// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  eventDataValidator,
  eventResolver,
  eventExternalResolver,
  eventDataResolver,
} from './event.schema'

import type { Application } from '../../declarations'
import { EventService, getOptions } from './event.class'
import { eventPath, eventMethods } from './event.shared'

export * from './event.class'
export * from './event.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const event = (app: Application) => {
  // Register our service on the Feathers application
  app.use(eventPath, new EventService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: eventMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(eventPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(eventExternalResolver),
        schemaHooks.resolveResult(eventResolver)
      ]
    },
    before: {
      create: [schemaHooks.validateData(eventDataValidator), schemaHooks.resolveData(eventDataResolver)],
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
    [eventPath]: EventService
  }
}
