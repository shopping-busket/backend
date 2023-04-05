// For more information about this file see https://dove.feathersjs.com/guides/cli/service.test.html
import assert from 'assert';
import { app } from '../../../src/app';

describe('share-link-user service', () => {
  it('registered the service', () => {
    const service = app.service('share-link-user');

    assert.ok(service, 'Registered the service');
  });
});
