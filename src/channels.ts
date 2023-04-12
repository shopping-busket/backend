// For more information about this file see https://dove.feathersjs.com/guides/cli/channels.html
import type { Params, RealTimeConnection } from '@feathersjs/feathers';
import type { AuthenticationResult } from '@feathersjs/authentication';
import '@feathersjs/transport-commons';
import type { Application } from './declarations';

export const channels = (app: Application) => {
  app.on('connection', (connection: RealTimeConnection) => {
    // On a new real-time connection, add it to the anonymous channel
    app.channel('anonymous').join(connection);
  });

  app.on('login', (authResult: AuthenticationResult, { connection }: Params) => {
    // connection can be undefined if there is no
    // real-time connection, e.g. when logging in via REST
    if (connection) {
      // The connection is no longer anonymous, remove it
      app.channel('anonymous').leave(connection);

      // Add it to the authenticated user channel
      app.channel('authenticated').join(connection);
    }
  });
};
