import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Sequelize } from 'sequelize';
import { Event as IEvent, EventReceiver } from './eventReceiver';
import { NotFound } from "@feathersjs/errors";

interface Data {
  listid: string,
  eventData: IEvent,
}

interface ServiceOptions {
}

export class Event implements ServiceMethods<Data> {
  sequelizeClient: Sequelize;
  app: Application;
  options: ServiceOptions;
  eventReceiver: EventReceiver;

  constructor(options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
    this.sequelizeClient = this.app.get('sequelizeClient');
    this.eventReceiver = new EventReceiver();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async create(data: Data[], params?: Params): Promise<Data[]> {
    for (const d of data) {
      const event = d.eventData;

      const oldList = await this.sequelizeClient.models.list.findOne({ where: { listid: d.listid } });
      if (!oldList) throw new NotFound('List not found. Is the given listid correct?');

      const entries = oldList?.getDataValue('entries');
      if (!entries.items) entries.items = [];

      let { found, update } = (await this.eventReceiver.receive({ event, list: oldList }));
      if (!found) throw new NotFound('Item not found!');

      console.log('upd', JSON.stringify(update, null, 4));

      const list = await this.sequelizeClient.models.list.findOne({ where: { listid: d.listid } });
      if (!list) throw new NotFound('List not found. Is the given listid correct?');
      await list?.update(update).catch(e => console.log);
    }

    return data;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async find(params?: Params): Promise<Data[] | Paginated<Data>> {
    return Promise.reject('Not implemented. Only allows CREATE!');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async get(id: Id, params?: Params): Promise<Data> {
    return Promise.reject('Not implemented. Only allows CREATE!');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update(id: NullableId, data: Data, params?: Params): Promise<Data> {
    return Promise.reject('Not implemented. Only allows CREATE!');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async patch(id: NullableId, data: Data, params?: Params): Promise<Data> {
    return Promise.reject('Not implemented. Only allows CREATE!');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async remove(id: NullableId, params?: Params): Promise<Data> {
    return Promise.reject('Not implemented. Only allows CREATE!');
  }
}
