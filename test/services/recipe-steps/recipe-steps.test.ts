// For more information about this file see https://dove.feathersjs.com/guides/cli/service.test.html
import assert from 'assert';
import { app } from '../../../src/app';

describe('recipe-steps service', () => {
  it('registered the service', () => {
    const service = app.service('recipe-steps')

    assert.ok(service, 'Registered the service')
  })
})
