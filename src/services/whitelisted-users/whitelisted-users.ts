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
import { HookContext } from '@feathersjs/feathers';
import { List } from '../list/list.schema';
import { User } from '../users/users.schema';
import emailHtml from './email';

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

        const backendURL = `${app.get('host')}:${app.get('port')}`;
        const joinURL = `//${frontend.host}:${frontend.port}/me/list/${data.listId}/join`;
        const info = await transporter.sendMail({
          from: `"${mailer.name}" <${mailer.address}>`,
          to: data.inviteEmail,
          subject: '🛍️🛒 You have been invited to a Busket list!',
          text: 'Hello world?',
          html: emailHtml(list.name, ownerName ?? 'Error', `//${backendURL}/img/banner.png`, joinURL, `//${backendURL}/view-mail?listId=${data.listId}&listName=${list.name}&ownerName=${ownerName ?? 'Error'}&joinURL=${joinURL}`),
        });

        console.log('Message sent: %s', info.messageId);

        return context;
      },
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
