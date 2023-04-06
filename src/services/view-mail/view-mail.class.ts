// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Params, ServiceInterface } from '@feathersjs/feathers';

import type { Application } from '../../declarations';
import type { ViewMail, ViewMailData, ViewMailPatch, ViewMailQuery } from './view-mail.schema';

export type { ViewMail, ViewMailData, ViewMailPatch, ViewMailQuery };

export interface ViewMailServiceOptions {
  app: Application;
}

export interface ViewMailParams extends Params<ViewMailQuery> {
}

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class ViewMailService<ServiceParams extends ViewMailParams = ViewMailParams> implements ServiceInterface<ViewMail, ViewMailData, ServiceParams, ViewMailPatch> {
  constructor(public options: ViewMailServiceOptions) {
  }

  async find(_params?: ServiceParams): Promise<ViewMail[]> {
    return [];
  }
}

export const getOptions = (app: Application) => {
  return { app };
};
