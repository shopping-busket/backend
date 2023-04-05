// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers';
import type { ClientApplication } from '../../client';
import type {
  ShareLinkUser,
  ShareLinkUserData,
  ShareLinkUserPatch,
  ShareLinkUserQuery,
  ShareLinkUserService,
} from './share-link-user.class';

export type { ShareLinkUser, ShareLinkUserData, ShareLinkUserPatch, ShareLinkUserQuery };

export type ShareLinkUserClientService = Pick<
  ShareLinkUserService<Params<ShareLinkUserQuery>>,
  (typeof shareLinkUserMethods)[number]
>;

export const shareLinkUserPath = 'share-link-user';

export const shareLinkUserMethods = ['find', 'get', 'create', 'patch', 'remove'] as const;

export const shareLinkUserClient = (client: ClientApplication) => {
  const connection = client.get('connection');

  client.use(shareLinkUserPath, connection.service(shareLinkUserPath), {
    methods: shareLinkUserMethods,
  });
};

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [shareLinkUserPath]: ShareLinkUserClientService;
  }
}
