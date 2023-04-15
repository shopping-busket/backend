// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication';
import nodemailer from 'nodemailer';

import { hooks as schemaHooks } from '@feathersjs/schema';

import {
  WhitelistedUsers,
  whitelistedUsersDataResolver,
  whitelistedUsersDataValidator,
  whitelistedUsersExternalResolver,
  whitelistedUsersPatchResolver,
  whitelistedUsersPatchValidator,
  whitelistedUsersQueryResolver,
  whitelistedUsersQueryValidator,
  whitelistedUsersResolver,
} from './whitelisted-users.schema';

import type { Application } from '../../declarations';
import { getOptions, WhitelistedUsersService } from './whitelisted-users.class';
import { whitelistedUsersMethods, whitelistedUsersPath } from './whitelisted-users.shared';
import { HookContext, Paginated } from '@feathersjs/feathers';
import { List } from '../list/list.schema';
import { User } from '../users/users.schema';
import emailHtml from './email';
import { randomUUID } from 'crypto';
import { requireDataToBeObject } from '../../helpers/channelSecurity';
import { Library } from '../library/library.schema';

export * from './whitelisted-users.class';
export * from './whitelisted-users.schema';

// A configure function that registers the service and its hooks via `app.configure`
export const whitelistedUsers = (app: Application) => {
  // Register our service on the Feathers application
  app.use(whitelistedUsersPath, new WhitelistedUsersService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: whitelistedUsersMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  });

  // Secure channels
  // Publish removed event to user who got kicked
  app.service(whitelistedUsersPath).publish('removed', (whitelistedUser: WhitelistedUsers | WhitelistedUsers[] | Paginated<WhitelistedUsers>) => {
    return app.channel(app.channels).filter(conn => conn.user.uuid === requireDataToBeObject(whitelistedUser).user);
  });

  // Publish patched to list owner
  app.service(whitelistedUsersPath).publish('patched', async (_whitelistedUser: WhitelistedUsers | WhitelistedUsers[] | Paginated<WhitelistedUsers>) => {
    const knex = app.get('postgresqlClient');
    const whitelisted = requireDataToBeObject(_whitelistedUser);

    const { owner: listOwner } = await knex('list').select('owner').where({
      listid: whitelisted.listId,
    }).first() as Pick<List, 'owner'>;

    const _whitelisted = await knex('whitelisted-users').select('user').where({
      listId: whitelisted.listId,
    }) as Pick<WhitelistedUsers, 'user'>[];
    const whitelistedUser = _whitelisted.find(w => w.user === whitelisted.user)?.user;

    return app.channel(app.channels).filter(conn => conn.user.uuid === listOwner || conn.user.uuid === whitelistedUser);
  });

  // Initialize hooks
  app.service(whitelistedUsersPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(whitelistedUsersExternalResolver),
        schemaHooks.resolveResult(whitelistedUsersResolver),
      ],
    },
    before: {
      all: [
        schemaHooks.validateQuery(whitelistedUsersQueryValidator),
        schemaHooks.resolveQuery(whitelistedUsersQueryResolver),
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(whitelistedUsersDataValidator),
        schemaHooks.resolveData(whitelistedUsersDataResolver),
      ],
      patch: [
        schemaHooks.validateData(whitelistedUsersPatchValidator),
        schemaHooks.resolveData(whitelistedUsersPatchResolver),
      ],
      remove: [],
    },
    after: {
      all: [],
      async create(context: HookContext): Promise<HookContext> {
        const data = context.result as WhitelistedUsers;
        const knex = app.get('postgresqlClient');
        const frontend = app.get('frontend');

        const list = await knex('list').select('name', 'owner').where({
          listid: data.listId,
        }).first() as Pick<List, 'name' | 'owner'>;

        const { fullName: ownerName } = await knex('users').select('fullName').where({
          uuid: list.owner,
        }).first() as Pick<User, 'fullName'>;

        const inviteSecret = randomUUID();
        await knex('whitelisted-users').update({
          inviteSecret,
        } as Partial<WhitelistedUsers>).where({
          id: data.id,
        });


        const mailer = app.get('mailer');

        const transporter = nodemailer.createTransport({
          host: mailer.host,
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: mailer.address, // generated ethereal user
            pass: mailer.password, // generated ethereal password
          },
        });

        const backendProtocol = app.get('ssl') ? 'https' : 'http';
        const backendURL = `${backendProtocol}://${app.get('host')}:${app.get('port')}`;
        const bannerImgURL = `${backendURL}/img/banner.png`;
        const joinURL = `${frontend.ssl ? 'https' : 'http'}://${frontend.host}:${frontend.port}/me/list/${data.listId}/join/${inviteSecret}/${data.id}`;

        const info = await transporter.sendMail({
          from: `"${mailer.name}"
          <${mailer.address}>`,
          to: data.inviteEmail,
          subject: '🛍️🛒 You have been invited to a Busket list!',
          text: `${ownerName} has invited you to their Busket list \"${list.name}\"! Click here to join the list:\n${joinURL}\nor ignore this E-mail!`,
          html: emailHtml(list.name, ownerName ?? 'Error', bannerImgURL, joinURL, `${backendURL}/view-mail?listId=${data.listId}&listName=${list.name}&ownerName=${ownerName ?? 'Error'}&joinURL=${encodeURIComponent(joinURL)}&bannerImgURL=${encodeURIComponent(bannerImgURL)}`),
        });

        console.log('Message sent: %s', info.messageId);

        return context;
      },
      async remove(context: HookContext): Promise<HookContext> {
        const data = context.result as WhitelistedUsers;
        const knex = app.get('postgresqlClient');

        await knex('library').delete().where({
          user: data.user,
          listId: data.listId,
        } as Partial<Library>);
        return context;
      }
    },
    error: {
      all: [],
    },
  });
};

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [whitelistedUsersPath]: WhitelistedUsersService;
  }
}
