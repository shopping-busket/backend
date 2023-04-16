// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Id, Params } from '@feathersjs/feathers';
import type { KnexAdapterOptions, KnexAdapterParams } from '@feathersjs/knex';
import { KnexService } from '@feathersjs/knex';

import type { Application } from '../../declarations';
import type { VerifyEmail, VerifyEmailData, VerifyEmailQuery } from './verify-email.schema';
import { BadRequest, NotFound } from '@feathersjs/errors';
import { app } from '../../app';
import { verifyEmailPath } from './verify-email.shared';
import { User, userPath } from '../users/users.shared';

export type { VerifyEmail, VerifyEmailData, VerifyEmailQuery };

export interface VerifyEmailParams extends KnexAdapterParams<VerifyEmailQuery> {
}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class VerifyEmailService<ServiceParams extends Params = VerifyEmailParams> extends KnexService<
  string,
  VerifyEmailData,
  VerifyEmailParams
> {
  async get(_: Id, params?: VerifyEmailParams): Promise<string> {
    if (!params) throw new BadRequest('Params have to be present!');
    if (!params.query) throw new Error('Impossible params.query is null! typebox should have thrown before this!');

    const knex = app.get('postgresqlClient');
    const verifyEmailEntry = await knex('verify-email').select('id', 'user', 'expiresAt').where({
      verifySecret: params.query.verifySecret,
    } as Partial<VerifyEmail>).first() as Pick<VerifyEmail, 'id' | 'user' | 'expiresAt'> | undefined;
    if (!verifyEmailEntry) throw new NotFound('No record found with this verifySecret!');

    if (Date.now() >= new Date(verifyEmailEntry.expiresAt).getTime()) {
      await app.service(verifyEmailPath).remove(verifyEmailEntry.id);
      await app.service(verifyEmailPath).create({
        user: verifyEmailEntry?.user,
      });

      return 'Expired! We sent you a new email with a new URL!';
    }

    const { id: userId } = await knex('users').select('id').where({
      uuid: verifyEmailEntry.user,
    } as Partial<User>).first() as Pick<User, 'id'> | undefined ?? { id: null };
    if (!userId) throw new NotFound('User not found!');

    await app.service(userPath).patch(userId, {
      verifiedEmail: true,
    } as Partial<User>);

    await app.service(verifyEmailPath).remove(verifyEmailEntry.id);
    return 'Verified!';
  }
}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: false,
    Model: app.get('postgresqlClient'),
    name: 'verify-email',
  };
};
