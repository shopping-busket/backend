// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers';
import type { ClientApplication } from '../../client';
import type { ViewMail, ViewMailQuery, ViewMailService } from './view-mail.class';

export type { ViewMail, ViewMailQuery };

export type ViewMailClientService = Pick<
  ViewMailService<Params<ViewMailQuery>>,
  (typeof viewMailMethods)[number]
>;

export const viewMailPath = 'view-mail';

export const viewMailMethods = ['get'] as const;

export const viewMailClient = (client: ClientApplication) => {
  const connection = client.get('connection');

  client.use(viewMailPath, connection.service(viewMailPath), {
    methods: viewMailMethods,
  });
};

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [viewMailPath]: ViewMailClientService;
  }
}
