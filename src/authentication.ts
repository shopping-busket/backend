import { ServiceAddons } from '@feathersjs/feathers';
import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication';
import { LocalStrategy } from '@feathersjs/authentication-local';
import { expressOauth, OAuthProfile, OAuthStrategy } from '@feathersjs/authentication-oauth';

import { Application } from './declarations';

declare module './declarations' {
  interface ServiceTypes {
    'authentication': AuthenticationService & ServiceAddons<any>;
  }
}

class GoogleStrategy extends OAuthStrategy {
  async getEntityData (profile: OAuthProfile, _existingEntity: any, _params: any) {

    // this will set 'googleId'
    const baseData = await super.getEntityData(profile, _existingEntity, _params);

    // this will grab the picture and email address of the Google profile
    console.log('auth', profile);
    return {
      ...baseData,
      profilePicture: profile.picture,
      email: profile.email
    };
  }
}

export default function(app: Application): void {
  const authentication = new AuthenticationService(app);

  authentication.register('jwt', new JWTStrategy());
  authentication.register('local', new LocalStrategy());
  // authentication.register('google', new GoogleStrategy());

  app.use('/authentication', authentication);
  app.configure(expressOauth());
}
