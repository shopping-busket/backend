// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication';
import nodemailer from 'nodemailer';

import { hooks as schemaHooks } from '@feathersjs/schema';

import {
  whitelistedUsersDataValidator,
  whitelistedUsersPatchValidator,
  whitelistedUsersQueryValidator,
  whitelistedUsersResolver,
  whitelistedUsersExternalResolver,
  whitelistedUsersDataResolver,
  whitelistedUsersPatchResolver,
  whitelistedUsersQueryResolver, WhitelistedUsers,
} from './whitelisted-users.schema';

import type { Application } from '../../declarations';
import { WhitelistedUsersService, getOptions } from './whitelisted-users.class';
import { whitelistedUsersPath, whitelistedUsersMethods } from './whitelisted-users.shared';
import { HookContext } from '@feathersjs/feathers';

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

        const info = await transporter.sendMail({
          from: `"${mailer.name}" <${mailer.address}>`,
          to: (context.result as WhitelistedUsers).inviteEmail,
          subject: '🛍️🛒 You have been invited to a Busket list!',
          text: 'Hello world?',
          html: '<b>Hello world?</b>',
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
