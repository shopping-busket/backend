// For more information about this file see https://dove.feathersjs.com/guides/cli/client.html
import type { Application, TransportConnection } from '@feathersjs/feathers';
import { feathers } from '@feathersjs/feathers';
import type { AuthenticationClientOptions } from '@feathersjs/authentication-client';

import { shareLinkUserClient } from './services/share-link-user/share-link-user.shared';
export type {
  ShareLinkUser,
  ShareLinkUserData,
  ShareLinkUserQuery,
  ShareLinkUserPatch,
} from './services/share-link-user/share-link-user.shared';

import authenticationClient from '@feathersjs/authentication-client';

import { shareLinkClient } from './services/share-link/share-link.shared';

import { eventClient } from './services/event/event.shared';
import { listClient } from './services/list/list.shared';
import { userClient } from './services/users/users.shared';

export type {
  ShareLink,
  ShareLinkData,
  ShareLinkQuery,
  ShareLinkPatch,
} from './services/share-link/share-link.shared';

export type { Event, EventData, EventQuery, EventPatch } from './services/event/event.shared';

export type { List, ListData, ListQuery, ListPatch } from './services/list/list.shared';

export type { User, UserData, UserQuery, UserPatch } from './services/users/users.shared';

export interface Configuration {
  connection: TransportConnection<ServiceTypes>;
}

export interface ServiceTypes {}

export type ClientApplication = Application<ServiceTypes, Configuration>;

/**
 * Returns a typed client for the backend app.
 *
 * @param connection The REST or Socket.io Feathers client connection
 * @param authenticationOptions Additional settings for the authentication client
 * @see https://dove.feathersjs.com/api/client.html
 * @returns The Feathers client application
 */
export const createClient = <Configuration = any>(
  connection: TransportConnection<ServiceTypes>,
  authenticationOptions: Partial<AuthenticationClientOptions> = {},
) => {
  const client: ClientApplication = feathers();

  client.configure(connection);
  client.configure(authenticationClient(authenticationOptions));
  client.set('connection', connection);

  client.configure(userClient);
  client.configure(listClient);
  client.configure(eventClient);
  client.configure(shareLinkClient);
  client.configure(shareLinkUserClient);
  return client;
};
