// Initializes the `log` service on path `/log`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Log } from './log.class';
import hooks from './log.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'log': Log & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/log', new Log(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('log');

  service.hooks(hooks);
}
