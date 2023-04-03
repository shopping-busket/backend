// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers';
import type { ClientApplication } from '../../client';
import type { ShareLink, ShareLinkData, ShareLinkPatch, ShareLinkQuery, ShareLinkService } from './share-link.class';

export type { ShareLink, ShareLinkData, ShareLinkPatch, ShareLinkQuery };

export type ShareLinkClientService = Pick<
  ShareLinkService<Params<ShareLinkQuery>>,
  (typeof shareLinkMethods)[number]
>;

export const shareLinkPath = 'share-link';

export const shareLinkMethods = ['find', 'get', 'create', 'patch', 'remove'] as const;

export const shareLinkClient = (client: ClientApplication) => {
  const connection = client.get('connection');

  client.use(shareLinkPath, connection.service(shareLinkPath), {
    methods: shareLinkMethods,
  });
};

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [shareLinkPath]: ShareLinkClientService;
  }
}
