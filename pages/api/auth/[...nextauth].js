/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import NextAuth from 'next-auth';

const tenantName = process.env.AUTH_TENANT_NAME;
const userFlow = process.env.AUTH_USER_FLOW;

const options = {
  session: {
    jwt: true,
  },
  secret: process.env.JWT_SECRET,
  pages: {
    signOut: '/auth/signout',
  },
  providers: [
    {
      id: 'azureb2c',
      name: 'Azure B2C',
      type: 'oauth',
      version: '2.0',
      debug: true,
      scope: 'offline_access openid',
      params: {
        grant_type: 'authorization_code',
      },
      accessTokenUrl: `https://${tenantName}.b2clogin.com/${tenantName}.onmicrosoft.com/${userFlow}/oauth2/v2.0/token`,
      authorizationUrl: `https://${tenantName}.b2clogin.com/${tenantName}.onmicrosoft.com/${userFlow}/oauth2/v2.0/authorize?response_type=code+id_token&response_mode=form_post`,
      profileUrl: 'https://graph.microsoft.com/oidc/userinfo',
      profile: (profile) => {
        // eslint-disable-next-line no-console
        console.log('THE PROFILE', profile);

        return {
          id: profile.oid,
          name: `${profile.given_name} ${profile.family_name}`,
          email: profile.emails.length ? profile.emails[0] : null,
        };
      },
      clientId: process.env.AUTH_CLIENT_ID,
      clientSecret: process.env.AUTH_CLIENT_SECRET,
      idToken: true,
      state: false,
    },
  ],
};

export default (req, res) => NextAuth(req, res, options);