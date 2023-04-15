// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html
import { feathers } from '@feathersjs/feathers';
import configuration from '@feathersjs/configuration';
import { bodyParser, cors, errorHandler, koa, parseAuthentication, rest, serveStatic } from '@feathersjs/koa';
import socketio from '@feathersjs/socketio';

import { configurationValidator } from './configuration';
import type { Application } from './declarations';
import { logError } from './hooks/log-error';
import { postgresql } from './postgresql';
import { authentication } from './authentication';
import { services } from './services';
import { channels } from './channels';

const swagger = require('feathers-swagger');

const app: Application = koa(feathers());

// Load our app configuration (see config/ folder)
app.configure(configuration(configurationValidator));

// Set up Koa middleware
app.use(cors());
app.use(serveStatic(app.get('public')));
app.use(errorHandler());
app.use(parseAuthentication());
app.use(bodyParser());


// Configure services and transports
app.configure(swagger({
  specs: {
    info: {
      title: 'Feathers app with swagger with authentication',
      version: '1.0.0',
      description: '...',
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
}))
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

export { app };
