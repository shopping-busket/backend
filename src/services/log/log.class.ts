import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '../../declarations';

interface Data {
  event: string,
  entryId: string,
  state: {
    name: string,
    done: boolean,
  },
  isoDate: string,
}

interface ServiceOptions {
}

export class Log implements ServiceMethods<Data> {
  app: Application;
  options: ServiceOptions;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async create (data: Data, params?: Params): Promise<Data> {
    console.log(data);
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
