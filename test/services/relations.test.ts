import assert from 'assert';
import app from '../../src/app';

describe('\'relations\' service', () => {
  it('registered the service', () => {
    const service = app.service('relations');

    assert.ok(service, 'Registered the service');
  });
});
