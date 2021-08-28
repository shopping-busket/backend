import assert from 'assert';
import app from '../../src/app';

describe('\'list\' service', () => {
  it('registered the service', () => {
    const service = app.service('list');

    assert.ok(service, 'Registered the service');
  });
});
