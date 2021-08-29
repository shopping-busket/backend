// Initializes the `event` service on path `/event`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Event } from './event.class';
import hooks from './event.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'event': Event & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/event', new Event(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('event');

  service.hooks(hooks);
}
