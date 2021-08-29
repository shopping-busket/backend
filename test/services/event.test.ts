import assert from 'assert';
import app from '../../src/app';

describe('\'event\' service', () => {
  it('registered the service', () => {
    const service = app.service('event');

    assert.ok(service, 'Registered the service');
  });
});
