// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Params, ServiceInterface } from '@feathersjs/feathers';

import type { Application } from '../../declarations';
import type { ViewMail, ViewMailQuery } from './view-mail.schema';
import emailHtml from '../whitelisted-users/email';

export type { ViewMail, ViewMailQuery };

export interface ViewMailServiceOptions {
  app: Application;
}

export interface ViewMailParams extends Params<ViewMailQuery> {
}

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class ViewMailService<ServiceParams extends ViewMailParams = ViewMailParams> implements ServiceInterface<string, string, ServiceParams> {
  constructor(public options: ViewMailServiceOptions) {
  }

  async find(params?: ServiceParams): Promise<string> {
    if (!params || !params.query) return 'Error';
    return emailHtml(params.query.listName, params.query.ownerName, decodeURIComponent(params.query.bannerImgURL), decodeURIComponent(params.query.joinURL), '');
  }
}

export const getOptions = (app: Application) => {
  return { app };
};
