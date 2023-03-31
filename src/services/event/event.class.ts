// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Id, NullableId, Params, ServiceInterface } from '@feathersjs/feathers'

import type { Application } from '../../declarations'
import type { Event, EventData, EventPatch, EventQuery } from './event.schema'

export type { Event, EventData, EventPatch, EventQuery }

export interface EventServiceOptions {
  app: Application
}

export interface EventParams extends Params<EventQuery> {}

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class EventService<ServiceParams extends EventParams = EventParams>
  implements ServiceInterface<Event, EventData, ServiceParams, EventPatch>
{
  constructor(public options: EventServiceOptions) {}

  async find(_params?: ServiceParams): Promise<Event[]> {
    return []
  }

  async get(id: Id, _params?: ServiceParams): Promise<Event> {
    return {
      id: 0,
      text: `A new message with ID: ${id}!`
    }
  }

  async create(data: EventData, params?: ServiceParams): Promise<Event>
  async create(data: EventData[], params?: ServiceParams): Promise<Event[]>
  async create(data: EventData | EventData[], params?: ServiceParams): Promise<Event | Event[]> {
    if (Array.isArray(data)) {
      return Promise.all(data.map((current) => this.create(current, params)))
    }

    return {
      id: 0,
      ...data
    }
  }

  // This method has to be added to the 'methods' option to make it available to clients
  async update(id: NullableId, data: EventData, _params?: ServiceParams): Promise<Event> {
    return {
      id: 0,
      ...data
    }
  }

  async patch(id: NullableId, data: EventPatch, _params?: ServiceParams): Promise<Event> {
    return {
      id: 0,
      text: `Fallback for ${id}`,
      ...data
    }
  }

  async remove(id: NullableId, _params?: ServiceParams): Promise<Event> {
    return {
      id: 0,
      text: 'removed'
    }
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
