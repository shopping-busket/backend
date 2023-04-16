// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Params, ServiceInterface } from '@feathersjs/feathers';

import type { Application } from '../../declarations';
import type {
  ViewMailInvite,
  ViewMailInviteQuery,
  ViewMailVerification,
  ViewMailVerificationQuery,
} from './view-mail.schema';
import { inviteEmailHTML, verifyEmailHTML } from '../../helpers/email';

export type { ViewMailInvite, ViewMailInviteQuery, ViewMailVerification, ViewMailVerificationQuery };

export interface ViewMailServiceOptions {
  app: Application;
}

export interface ViewMailParams extends Params<ViewMailInviteQuery | ViewMailVerificationQuery> {
}

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class ViewMailService<ServiceParams extends ViewMailParams = ViewMailParams> implements ServiceInterface<string, string, ServiceParams> {
  constructor(public options: ViewMailServiceOptions) {
  }

  async get(id: number, params?: ServiceParams): Promise<string> {
    if (!params || params.query === undefined) return 'Error';

    const inviteQuery = params.query as ViewMailInviteQuery;
    const verificationQuery = params.query as ViewMailVerificationQuery;

    if (id === 0) return inviteEmailHTML(inviteQuery.listName, inviteQuery.ownerName, decodeURIComponent(inviteQuery.bannerImgURL), decodeURIComponent(inviteQuery.joinURL), '');
    else if (id === 1) return verifyEmailHTML(verificationQuery.verifyURL, verificationQuery.bannerImgURL, '');
    return 'Email type out of bounds!';
  }
}

export const getOptions = (app: Application) => {
  return { app };
};
