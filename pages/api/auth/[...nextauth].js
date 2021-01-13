/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import NextAuth from 'next-auth';

const tenantName = process.env.AUTH_TENANT_NAME;
const userFlow = process.env.AUTH_USER_FLOW;

// our problem seems to be that the POST to
// http://localhost:3000/api/auth/signin/azureb2c succeeds
// while the POST to 
// http://localhost:3000/member/api/auth/signin/azureb2c
// (i.e. when NEXTAUTH_URL is set to http://localhost:3000/member/api/auth
// rather than http://localhost:3000)
// returns a 404. The issue is the same in both this example repo and the
// current implementation of our actual app (branch bb/VEG-140)

// Unfortunately the only documentation on this is a few lines at the top
// of the following page:
// https://next-auth.js.org/configuration/options

// This seems to be an issue with our Azure configuration. There are redirect
// uris for /member/api/auth/ but something else must be needed.
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