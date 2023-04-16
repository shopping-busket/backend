// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers';
import type { ClientApplication } from '../../client';
import type { VerifyEmail, VerifyEmailData, VerifyEmailQuery, VerifyEmailService } from './verify-email.class';

export type { VerifyEmail, VerifyEmailData, VerifyEmailQuery };

export type VerifyEmailClientService = Pick<
  VerifyEmailService<Params<VerifyEmailQuery>>,
  (typeof verifyEmailMethods)[number]
>;

export const verifyEmailPath = 'verify-email';

export const verifyEmailMethods = ['create', 'remove'] as const;

export const verifyEmailClient = (client: ClientApplication) => {
  const connection = client.get('connection');

  client.use(verifyEmailPath, connection.service(verifyEmailPath), {
    methods: verifyEmailMethods,
  });
};

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [verifyEmailPath]: VerifyEmailClientService;
  }
}
