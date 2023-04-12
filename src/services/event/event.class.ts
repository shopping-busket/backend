// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Params, ServiceInterface } from '@feathersjs/feathers';

import type { Application } from '../../declarations';
import type { Event, EventData, EventPatch, EventQuery } from './event.schema';
import { EventReceiver } from './eventReceiver';
import { app } from '../../app';
import { Forbidden, NotFound } from '@feathersjs/errors';
import { IShoppingList } from '../../shoppinglist/ShoppingList';
import { WhitelistedUsers } from '../whitelisted-users/whitelisted-users.schema';
import { EventType } from '../../shoppinglist/events';

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

  async create(dataArray: EventData, params: ServiceParams): Promise<Event>
  async create(dataArray: EventData[], params: ServiceParams): Promise<Event[]>
  async create(dataArray: EventData | EventData[], params: ServiceParams): Promise<Event | Event[]> {
    if (!Array.isArray(dataArray)) return dataArray;
    const knex = app.get('postgresqlClient');

    for (const data of dataArray) {
      const list = await this.postgresClient.select().from('list').where('listid', '=', data.listid).first<IShoppingList>();
      if (!list) throw new NotFound('List not found. Is the given listid correct?');
      if (params.user == null) throw new Forbidden();

      if (params.user.uuid !== list.owner) {
        const {
          canDeleteEntries,
          canEditEntries,
        } = await knex('whitelisted-users').select('canDeleteEntries', 'canEditEntries').where({
          listId: list.listid,
          user: params.user.uuid,
        } as Partial<WhitelistedUsers>).first() as Pick<WhitelistedUsers, 'canDeleteEntries' | 'canEditEntries'>;

        if (!canEditEntries) throw new Forbidden('You are not allowed to edit ANY entry data. DELETE_ENTRY is part of this!');
        if (data.eventData.event === EventType.DELETE_ENTRY && !canDeleteEntries) throw new Forbidden('You are not allowed to emit events of type DELETE_ENTRY!');
      }

      const newState = (await this.eventReceiver.receive({ event: data.eventData, list }));
      await this.eventReceiver.applyUpdateIfFound(newState);
    }

    return dataArray;
  }

}

export const getOptions = (app: Application) => {
  return { app };
};
