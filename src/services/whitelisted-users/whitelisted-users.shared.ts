// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers';
import type { ClientApplication } from '../../client';
import type {
  WhitelistedUsers,
  WhitelistedUsersData,
  WhitelistedUsersPatch,
  WhitelistedUsersQuery,
  WhitelistedUsersService,
} from './whitelisted-users.class';

export type { WhitelistedUsers, WhitelistedUsersData, WhitelistedUsersPatch, WhitelistedUsersQuery };

export type WhitelistedUsersClientService = Pick<
  WhitelistedUsersService<Params<WhitelistedUsersQuery>>,
  (typeof whitelistedUsersMethods)[number]
>;

export const whitelistedUsersPath = 'whitelisted-users';

export const whitelistedUsersMethods = ['find', 'get', 'create', 'patch', 'remove'] as const;

export const whitelistedUsersClient = (client: ClientApplication) => {
  const connection = client.get('connection');

  client.use(whitelistedUsersPath, connection.service(whitelistedUsersPath), {
    methods: whitelistedUsersMethods,
  });
};

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [whitelistedUsersPath]: WhitelistedUsersClientService;
  }
}
