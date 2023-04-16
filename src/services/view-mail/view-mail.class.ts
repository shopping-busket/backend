// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { NullableId, Params, ServiceInterface } from '@feathersjs/feathers';

import type { Application } from '../../declarations';
import type { ViewMail, ViewMailQuery } from './view-mail.schema';
import { inviteEmailHTML } from '../../helpers/email';

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

  async get(_id: NullableId, params?: ServiceParams): Promise<string> {
    if (!params || !params.query || !_id) return 'Error';
    const id = typeof _id === 'string' ? parseInt(_id) : _id;
    if (Number.isNaN(id)) return 'id is not a parseable number!';

    if (id === 0) return inviteEmailHTML(params.query.listName, params.query.ownerName, decodeURIComponent(params.query.bannerImgURL), decodeURIComponent(params.query.joinURL), '');
    // else if (id === 1) return verifyEmailHTML(params.query.);
    else return 'Email type out of bounds!';
  }
}

export const getOptions = (app: Application) => {
  return { app };
};
