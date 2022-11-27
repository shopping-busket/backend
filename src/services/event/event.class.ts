import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Sequelize } from 'sequelize';
import { EventReceiver, RawEventData } from './eventReceiver';
import { NotFound } from '@feathersjs/errors';

interface ServiceOptions {
}

export class Event implements ServiceMethods<RawEventData> {
  sequelizeClient: Sequelize;
  app: Application;
  options: ServiceOptions;
  eventReceiver: EventReceiver;

  constructor(options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
    this.sequelizeClient = this.app.get('sequelizeClient');
    this.eventReceiver = new EventReceiver(this.sequelizeClient);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async create(dataArray: RawEventData[], params?: Params): Promise<RawEventData[]> {
    for (const data of dataArray) {
      const list = await this.sequelizeClient.models.list.findOne({ where: { listid: data.listid } });
      if (!list) throw new NotFound('List not found. Is the given listid correct?');

      const newState = (await this.eventReceiver.receive({ event: data.eventData, list }));
      await this.eventReceiver.applyUpdateIfFound(newState);
    }

    return dataArray;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async find(params?: Params): Promise<RawEventData[] | Paginated<RawEventData>> {
    return Promise.reject('Not implemented. Only allows CREATE!');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async get(id: Id, params?: Params): Promise<RawEventData> {
    return Promise.reject('Not implemented. Only allows CREATE!');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update(id: NullableId, data: RawEventData, params?: Params): Promise<RawEventData> {
    return Promise.reject('Not implemented. Only allows CREATE!');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async patch(id: NullableId, data: RawEventData, params?: Params): Promise<RawEventData> {
    return Promise.reject('Not implemented. Only allows CREATE!');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async remove(id: NullableId, params?: Params): Promise<RawEventData> {
    return Promise.reject('Not implemented. Only allows CREATE!');
  }
}
