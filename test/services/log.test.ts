import assert from 'assert';
import app from '../../src/app';

describe('\'log\' service', () => {
  it('registered the service', () => {
    const service = app.service('log');

    assert.ok(service, 'Registered the service');
  });
});
