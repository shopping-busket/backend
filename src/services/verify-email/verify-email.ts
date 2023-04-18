// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { hooks as schemaHooks } from '@feathersjs/schema';

import {
  VerifyEmail,
  verifyEmailDataResolver,
  verifyEmailDataValidator,
  verifyEmailQueryResolver,
  verifyEmailQueryValidator,
  verifyEmailResolver,
} from './verify-email.schema';

import type { Application } from '../../declarations';
import { getOptions, VerifyEmailService } from './verify-email.class';
import { verifyEmailMethods, verifyEmailPath } from './verify-email.shared';
import { HookContext } from '@feathersjs/feathers';
import { User } from '../users/users.schema';
import { NotFound } from '@feathersjs/errors';
import { verifyEmailHTML } from '../../helpers/email';

export * from './verify-email.class';
export * from './verify-email.schema';

// A configure function that registers the service and its hooks via `app.configure`
export const verifyEmail = (app: Application) => {
  // Register our service on the Feathers application
  app.use(verifyEmailPath, new VerifyEmailService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: verifyEmailMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    koa: {
      after: [
        async (ctx) => {
          if (ctx.req.method?.toLowerCase() !== 'get') return;

          const { ssl, port, host } = app.get('frontend');
          const frontend = `${ssl ? 'https' : 'http'}://${host}:${port}`;

          if ((ctx.response.body as string)?.toLowerCase().includes('expired')) return ctx.redirect(`${frontend}/email-verification?expired=true`);
          ctx.redirect(`${frontend}/email-verification`);
        },
      ],
    },
  });
  // Initialize hooks
  app.service(verifyEmailPath).hooks({
    around: {
      all: [
        schemaHooks.resolveResult(verifyEmailResolver),
      ],
    },
    before: {
      all: [
        schemaHooks.validateQuery(verifyEmailQueryValidator),
        schemaHooks.resolveQuery(verifyEmailQueryResolver),
      ],
      create: [
        schemaHooks.validateData(verifyEmailDataValidator),
        schemaHooks.resolveData(verifyEmailDataResolver),
      ],
    },
    after: {
      async create(context: HookContext): Promise<HookContext> {
        const data = context.result as VerifyEmail;
        const knex = app.get('postgresqlClient');

        const { email } = await knex('users').select('email').where({
          uuid: data.user,
        } as Partial<User>).first() as Pick<User, 'email'> | undefined ?? { email: null };
        if (!email) throw new NotFound('unable to send email because no entry was found in users table');

        const withPort = (port: number | string) => {
          if (process.env.NODE_ENV !== 'development') return '';
          return `:${port}`;
        }

        const backendProtocol = app.get('ssl') ? 'https' : 'http';
        const backendURL = `${backendProtocol}://${app.get('host')}${withPort(app.get('port'))}`;
        const bannerImgURL = `${backendURL}/img/banner.png`;
        const verifyURL = `${backendURL}/verify-email/0?verifySecret=${data.verifySecret}`;
        const viewInBrowserURL = `${backendURL}/view-mail/1?verifyURL=${encodeURIComponent(verifyURL)}&bannerImgURL=${encodeURIComponent(bannerImgURL)}`;

        await app.get('mailTransporter').sendMail({
          from: app.get('mailFrom'),
          to: email,
          subject: 'Verify your Busket Account!',
          text: `Click here: ${viewInBrowserURL} to verify your Busket account's email`,
          html: verifyEmailHTML(verifyURL, bannerImgURL, viewInBrowserURL),
        });

        return context;
      },
    },
  });
};

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [verifyEmailPath]: VerifyEmailService;
  }
}
