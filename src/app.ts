// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html
import { feathers } from '@feathersjs/feathers';
import configuration from '@feathersjs/configuration';
import { bodyParser, cors, koa, parseAuthentication, rest, serveStatic } from '@feathersjs/koa';
import socketio from '@feathersjs/socketio';

import { configurationValidator } from './configuration';
import type { Application } from './declarations';
import { logError } from './hooks/log-error';
import { postgresql } from './postgresql';
import { authentication } from './authentication';
import { services } from './services';
import { channels } from './channels';
import nodemailer from 'nodemailer';
import historyApiFallback from 'koa-history-api-fallback';
import { FeathersKoaContext } from '@feathersjs/koa/src/declarations';
import { FeathersError } from '@feathersjs/errors';

const swagger = require('feathers-swagger');

const app: Application = koa(feathers());

const historyMiddleware = historyApiFallback({
  verbose: true,
  logger: console.log.bind(console),
});

// Load our app configuration (see config/ folder)
app.configure(configuration(configurationValidator));

// Set up Koa middleware
app.use(cors());
app.use(async (ctx: FeathersKoaContext, next: () => Promise<any>) => {
    // Errors any error besides service not found
    await next().catch((error: any) => {
      ctx.response.status = error instanceof FeathersError ? error.code : 500;
      ctx.body =
        typeof error.toJSON === 'function'
          ? error.toJSON()
          : {
            message: error.message,
          };
    });
  },
);
app.use(parseAuthentication());
app.use(bodyParser());


// Configure services and transports
app.configure(swagger({
  specs: {
    info: {
      title: 'Busket Backend',
      version: '2.0.0',
      description: `Backend for Busket, a digital & open source shopping list.`,
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  ui: swagger.swaggerUI({ docsPath: '/docs' }),
}));
app.configure(rest());
app.configure(
  socketio({
    cors: {
      origin: app.get('origins'),
    },
  }),
);
app.configure(channels);
app.configure(postgresql);
app.configure(authentication);
app.configure(services);

app.use(historyMiddleware);
app.use(serveStatic(app.get('public')));

// Register hooks that run on all service methods
app.hooks({
  around: {
    all: [logError],
  },
  before: {},
  after: {},
  error: {},
});
// Register application setup and teardown hooks here
app.hooks({
  setup: [],
  teardown: [],
});

// Setup mailtransporter
const mailer = app.get('mailer');
app.set('mailTransporter', nodemailer.createTransport({
  host: mailer.host,
  port: 587,
  secure: false,
  auth: {
    user: mailer.address,
    pass: mailer.password,
  },
}));
app.set('mailFrom', `${mailer.name} <${mailer.address}>`);

if (!app.get('verifyEmails') && process.env.NODE_ENV === 'production') console.warn('verifyEmails is set to false! This means that the backend won\'t require users to have verified their emails. It is not recommended to have this disabled in production!');

export { app };
