import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Sequelize } from 'sequelize';
import { IShoppingListItem } from '../../shoppinglist/ShoppingList';

export enum EventType {
  MOVE_ENTRY = 'MOVE_ENTRY',
  DELETE_ENTRY = 'DELETE_ENTRY',
  CREATE_ENTRY = 'CREATE_ENTRY',
  CHANGED_ENTRY_NAME = 'CHANGED_ENTRY_NAME',
  MARK_ENTRY_DONE = 'MARK_ENTRY_DONE',
  MARK_ENTRY_TODO = 'MARK_ENTRY_TODO',
}

interface Data {
  listid: string,
  eventData: {
    event: EventType,
    entryId: string,
    state: {
      name: string,
      done: boolean,
    },
    isoDate: string,
  },
}

interface ServiceOptions {
}

export class Event implements ServiceMethods<Data> {
  sequelizeClient: Sequelize;
  app: Application;
  options: ServiceOptions;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
    this.sequelizeClient = this.app.get('sequelizeClient');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async create (data: Data[], params?: Params): Promise<Data[]> {
    for (const d of data) {
      const event = d.eventData;

      const oldList = await this.sequelizeClient.models.list.findOne({ where: { listid: d.listid } });
      if (!oldList) await Promise.reject('List not found. Is the given listid correct?');

      let updated = {};
      const entries = oldList?.getDataValue('entries');
      if (!entries.items) entries.items = [];

      let [found, update] = [false, {}];
      switch (event.event) {
        case EventType.CREATE_ENTRY:
          entries.items.push({ id: event.entryId, ...event.state });
          updated = { entries };
          break;
        case EventType.CHANGED_ENTRY_NAME:
          ({ found, update } = (await modifyEntryState('name', event.state.name)));
          console.log(found, update);

          if (!found) await Promise.reject('Item not found!');
          updated = update;

          break;
        case EventType.MARK_ENTRY_TODO:
          ({ found, update } = (await modifyEntryState('done', false)));


          if (!found) await Promise.reject('Item not found!');
          updated = update;

          break;
        case EventType.MARK_ENTRY_DONE:
          ({ found, update } = (await modifyEntryState('done', true)));

          if (!found) await Promise.reject('Item not found!');
          updated = update;

          break;
        case EventType.DELETE_ENTRY:
          console.log(`Delete entry at ${event.isoDate}`);

          const item = entries.items.forEach((t: IShoppingListItem, i: number) => {
            if (t.id === event.entryId) {
              entries.items.splice(i, 1);
              found = true;
            }
          });
          if (!found) await Promise.reject('Can\'t find item! Wrong id.');

          updated = { entries };

          break;
        case EventType.MOVE_ENTRY:
          console.log('Not implemented yet!');
          break;
        default:
          console.log('Received unknown event type!');
          await Promise.reject('Received unknown event type!');
      }

      async function modifyEntryState (key: string, val: boolean | string): Promise<{ found: boolean, update: Record<string, any> }> {
        entries.items.find((t: IShoppingListItem) => t.id === event.entryId)

        let found = false;
        let updated = {};
        for (let i = 0; i < entries.items.length; i++) {
          const entry: IShoppingListItem = entries.items[i];

          if (entry.id === event.entryId) {
            if (key === 'name' && typeof val === 'string') {
              entry.name = val;
            } else if (typeof val === 'boolean') {
              entry.done = val;
            }

            found = true;
            updated = { entries };
          }
        }

        return {
          found,
          update: updated,
        };
      }

      const listModel = this.sequelizeClient.models.list;

      const list = await listModel.findOne({ where: { listid: d.listid } });
      if (!list) {
        await Promise.reject('List not found. Is the given id correct?');
      }

      console.log('upd', updated);
      await list?.update(updated).catch(e => console.log);
    }

    return data;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async find (params?: Params): Promise<Data[] | Paginated<Data>> {
    return Promise.reject('Not implemented. Only allows CREATE!');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async get (id: Id, params?: Params): Promise<Data> {
    return Promise.reject('Not implemented. Only allows CREATE!');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return Promise.reject('Not implemented. Only allows CREATE!');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async patch (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return Promise.reject('Not implemented. Only allows CREATE!');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async remove (id: NullableId, params?: Params): Promise<Data> {
    return Promise.reject('Not implemented. Only allows CREATE!');
  }
}
