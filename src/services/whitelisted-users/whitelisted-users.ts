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

        const info = await transporter.sendMail({
          from: `"${mailer.name}" <${mailer.address}>`,
          to: data.inviteEmail,
          subject: '🛍️🛒 You have been invited to a Busket list!',
          text: 'Hello world?',
          html: `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title></title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0;
        padding: 0;
        font-family: 'Roboto', 'arial', Calibri, sans-serif;
        color: #3b3b3b;
        background: #fff8f0;
        height: 100vh;">
<div class="container" style="font-family:Arial, sans-serif;background:white;display:flex;flex-direction:column;width:100vw;height:100%;max-width:1000px;padding:4rem 4rem 0 0;margin:auto;">
  <div class="banner-logo" style="font-family:'Francois One', 'Roboto', arial, sans-serif;text-align:center;display:flex;align-items:center;flex-direction:column;width:100%;font-size:2rem;">
    <div style="font-family:Arial, sans-serif;height:6rem;">
      <svg xmlns="http://www.w3.org/2000/svg" width="780" height="380" viewbox="0 0 780 380" fill="none" style="height: 6rem;
        width: auto;"><g clip-path="url(#a)"><path stroke="#9C896D" stroke-width="33" d="M90.56 9.71c33.93 48.45 35.01 108.25 31.31 132.1"></path><path fill="#61A840" d="M345.13 204.4v-55.23h35.28v98.19h-33.5v-18.67h-1.02a27.9 27.9 0 0 1-11.18 14.7c-5.33 3.5-11.66 5.25-18.99 5.25-6.86 0-12.87-1.58-18.02-4.74a32.43 32.43 0 0 1-11.96-13.03c-2.81-5.55-4.24-11.9-4.28-19.05v-62.65h35.28v55.23c.05 4.86 1.28 8.67 3.71 11.44 2.47 2.77 5.93 4.16 10.36 4.16 2.94 0 5.47-.62 7.6-1.86a12.65 12.65 0 0 0 4.99-5.36 17.74 17.74 0 0 0 1.73-8.38Zm142.97-23.27h-32.47c-.17-2-.88-3.72-2.11-5.17a11.83 11.83 0 0 0-4.8-3.33 16.27 16.27 0 0 0-6.39-1.21 17 17 0 0 0-7.8 1.66c-2.17 1.1-3.23 2.68-3.2 4.73a5.35 5.35 0 0 0 1.86 4.03c1.32 1.23 3.86 2.2 7.6 2.87l19.95 3.58c10.06 1.84 17.54 4.93 22.44 9.27 4.94 4.3 7.43 10.08 7.48 17.32-.05 7-2.14 13.07-6.27 18.22-4.09 5.12-9.7 9.08-16.81 11.9-7.07 2.76-15.15 4.15-24.23 4.15-15 0-26.74-3.07-35.22-9.2-8.43-6.14-13.14-14.24-14.12-24.3h35.03c.46 3.11 2 5.52 4.6 7.22 2.64 1.67 5.96 2.5 9.97 2.5 3.24 0 5.9-.56 7.99-1.66 2.13-1.11 3.22-2.69 3.26-4.74-.04-1.87-.98-3.36-2.81-4.47-1.8-1.1-4.6-2-8.44-2.68l-17.39-3.07c-10.01-1.75-17.51-5.07-22.5-9.97-4.98-4.9-7.45-11.21-7.41-18.92-.04-6.82 1.75-12.6 5.37-17.33 3.66-4.77 8.88-8.4 15.66-10.86 6.82-2.52 14.9-3.77 24.23-3.77 14.19 0 25.37 2.94 33.55 8.82 8.23 5.88 12.55 14.02 12.98 24.41Zm47.78 42.96.25-41.93h4.6l23.79-32.99h39.63l-39.89 51.4h-9.97l-18.41 23.52Zm-31.7 23.27V116.45h35.28v130.9h-35.29Zm60.6 0-22.5-38.87 23-25.05 39.89 63.92h-40.4Zm91.56 1.79c-10.49 0-19.52-2-27.1-6.01a42.1 42.1 0 0 1-17.46-17.39c-4.04-7.58-6.07-16.66-6.07-27.23 0-10.14 2.05-19 6.14-26.59a43.86 43.86 0 0 1 17.32-17.7c7.46-4.22 16.26-6.33 26.4-6.33 7.41 0 14.13 1.15 20.13 3.45a42.14 42.14 0 0 1 15.41 10.03 44.21 44.21 0 0 1 9.84 15.86c2.3 6.22 3.46 13.23 3.46 21.02v8.19h-87.7V187h55.22a13.54 13.54 0 0 0-2.17-7.41 13.85 13.85 0 0 0-5.56-5.05 16.36 16.36 0 0 0-7.86-1.85c-2.86 0-5.48.62-7.87 1.85a14.86 14.86 0 0 0-5.75 4.99 14.05 14.05 0 0 0-2.24 7.47v20.97c0 3.16.67 5.97 1.99 8.44a14.37 14.37 0 0 0 5.69 5.82c2.47 1.4 5.45 2.1 8.94 2.1 2.43 0 4.65-.34 6.65-1.02 2.05-.68 3.8-1.66 5.24-2.94a11.97 11.97 0 0 0 3.2-4.73h32.22a36.7 36.7 0 0 1-7.87 17.77c-4.13 4.99-9.6 8.87-16.42 11.64-6.78 2.72-14.7 4.09-23.78 4.09Zm121.01-99.98v25.57h-64.68v-25.57h64.69Zm-52.15-23.52h35.28v90.13c0 1.36.23 2.51.7 3.45.47.9 1.2 1.58 2.18 2.05.98.42 2.23.64 3.77.64 1.06 0 2.3-.13 3.7-.39a47.4 47.4 0 0 0 3.2-.64l5.12 24.8a120.3 120.3 0 0 1-6.78 1.73 59.6 59.6 0 0 1-10.36 1.34c-8.1.43-14.89-.4-20.39-2.5-5.5-2.12-9.63-5.47-12.4-10.03-2.77-4.56-4.11-10.27-4.02-17.13v-93.45Zm-481.45 33.48c0 94.16-51.02 167.75-126.86 144.1C44.54 326.63 0 253.29 0 159.13s51.7-147.17 116.89-85.1c74.71-60.16 126.86-9.06 126.86 85.1Z"></path><path fill="#fff" d="M70.2 236.25V105.34h56.76c9.97 0 18.34 1.34 25.12 4.02 6.81 2.69 11.95 6.48 15.4 11.38 3.5 4.9 5.24 10.67 5.24 17.32 0 4.82-1.06 9.2-3.2 13.17a28.21 28.21 0 0 1-8.81 9.97 35.11 35.11 0 0 1-13.3 5.5v1.28a32.83 32.83 0 0 1 15.34 4.28 29.4 29.4 0 0 1 11 10.8c2.72 4.56 4.09 9.93 4.09 16.11 0 7.16-1.88 13.53-5.63 19.11-3.7 5.59-8.99 9.97-15.85 13.17-6.86 3.2-15.04 4.8-24.55 4.8H70.2Zm35.53-28.39h16.62c5.97 0 10.44-1.1 13.43-3.32 2.98-2.26 4.47-5.58 4.47-9.97 0-3.07-.7-5.67-2.1-7.8a13.15 13.15 0 0 0-6.02-4.86c-2.55-1.1-5.64-1.66-9.27-1.66h-17.13v27.61Zm0-49.6h14.58c3.1 0 5.86-.49 8.24-1.47a12.5 12.5 0 0 0 5.56-4.22 11.32 11.32 0 0 0 2.05-6.84c0-4.04-1.45-7.13-4.35-9.26-2.9-2.18-6.56-3.26-11-3.26h-15.08v25.05Z"></path></g><defs><clippath id="a"><path fill="#fff" d="M0 .5h780v379H0z"></path></clippath></defs></svg>
    </div>
    <span>${ownerName} has invited you to his list!</span>
  </div>

  <hr style="margin: 3rem auto;
        border-top: 1px solid;
        color: #dedede;
        width: 85%;">
  <main class="content" style="text-align: center;">
    Hello!
    <br>
    ${ownerName} has invited you to join his list:
    <br><div class="list-name" style="font-family:'Francois One', 'Roboto', arial, sans-serif;margin:0.6rem 0;font-size:3rem;">${list.name}</div>
    <br><div style="margin-bottom:1rem;font-family:Arial, sans-serif;">
    <a class="join-btn" href="https://localhost:5173/me/list/listid/invite" style="cursor: pointer;
        user-focus: none;
        background: #61A840FF;
        color: #fff;
        font-family: 'Roboto', arial, sans-serif;
        font-size: 1rem;
        font-weight: 400;
        border: none;
        border-radius: 10px;
        padding: 0.6rem;
        width: 20rem;

        text-decoration: none;

        transition: all 250ms ease-in-out;">Join this list</a>
  </div>

    <br><div style="opacity:70%;font-family:Arial, sans-serif;">
    If you don't want to join, just ignore this message.
  </div>
  </main>
</div>
</body>
</html>

`,
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
