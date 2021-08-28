// Initializes the `relations` service on path `/relations`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Relations } from './relations.class';
import createModel from '../../models/relations.model';
import hooks from './relations.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'relations': Relations & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/relations', new Relations(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('relations');

  service.hooks(hooks);
}
