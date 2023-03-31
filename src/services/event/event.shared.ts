// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers';
import type { ClientApplication } from '../../client';
import type { Event, EventData, EventPatch, EventQuery, EventService } from './event.class';

export type { Event, EventData, EventPatch, EventQuery }

export type EventClientService = Pick<EventService<Params<EventQuery>>, (typeof eventMethods)[number]>

export const eventPath = 'event'

export const eventMethods = ['create'] as const

export const eventClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(eventPath, connection.service(eventPath), {
    methods: eventMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [eventPath]: EventClientService
  }
}
