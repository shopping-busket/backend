// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers';
import type { ClientApplication } from '../../client';
import type { Library, LibraryData, LibraryQuery, LibraryService } from './library.class';

export type { Library, LibraryData, LibraryQuery };

export type LibraryClientService = Pick<
  LibraryService<Params<LibraryQuery>>,
  (typeof libraryMethods)[number]
>;

export const libraryPath = 'library';

export const libraryMethods = ['find', 'create', 'remove'] as const;

export const libraryClient = (client: ClientApplication) => {
  const connection = client.get('connection');

  client.use(libraryPath, connection.service(libraryPath), {
    methods: libraryMethods,
  });
};

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [libraryPath]: LibraryClientService;
  }
}
