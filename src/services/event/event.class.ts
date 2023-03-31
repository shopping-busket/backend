// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Params, ServiceInterface } from '@feathersjs/feathers';

import type { Application } from '../../declarations';
import type { Event, EventData, EventPatch, EventQuery } from './event.schema';
import { EventReceiver, EventType, RawEventData } from './eventReceiver';
import knex from 'knex';
import { app } from '../../app';
import { NotFound } from '@feathersjs/errors';
import ShoppingList, { IShoppingList } from '../../shoppinglist/ShoppingList';

export type { Event, EventData, EventPatch, EventQuery };

export interface EventServiceOptions {
  app: Application;
}

export interface EventParams extends Params<EventQuery> {
}

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class EventService<ServiceParams extends EventParams = EventParams>
  implements ServiceInterface<Event, Event, ServiceParams, EventPatch> {
  private postgresClient = app.get('postgresqlClient');
  private eventReceiver = new EventReceiver(this.postgresClient);

  constructor(public options: EventServiceOptions) {
  }

  async create(dataArray: EventData, params?: ServiceParams): Promise<Event>
  async create(dataArray: EventData[], params?: ServiceParams): Promise<Event[]>
  async create(dataArray: EventData | EventData[], params?: ServiceParams): Promise<Event | Event[]> {
    if (!Array.isArray(dataArray)) return dataArray;

    for (const data of dataArray) {
      const list = await this.postgresClient.select().from('list').where('listid', '=', data.listid).first<IShoppingList>();
      if (!list) throw new NotFound('List not found. Is the given listid correct?');

      const newState = (await this.eventReceiver.receive({ event: data.eventData, list }));
      await this.eventReceiver.applyUpdateIfFound(newState);
    }

    return dataArray;
  }

}

export const getOptions = (app: Application) => {
  return { app };
};
