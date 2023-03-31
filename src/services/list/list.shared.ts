// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers';
import type { ClientApplication } from '../../client';
import type { List, ListData, ListPatch, ListQuery, ListService } from './list.class';

export type { List, ListData, ListPatch, ListQuery };

export type ListClientService = Pick<ListService<Params<ListQuery>>, (typeof listMethods)[number]>

export const listPath = 'list';

export const listMethods = ['find', 'get', 'create', 'patch', 'remove'] as const;

export const listClient = (client: ClientApplication) => {
  const connection = client.get('connection');

  client.use(listPath, connection.service(listPath), {
    methods: listMethods
  });
};

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [listPath]: ListClientService;
  }
}
