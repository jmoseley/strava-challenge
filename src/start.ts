// Before anything, boot.
import './lib/boot';

import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as Router from 'express-promise-router';
import * as expressSession from 'express-session';
import * as passport from 'passport';
import * as morgan from 'morgan';
import * as webpack from 'webpack';
import { Server } from 'net';

import * as authHandler from './handlers/auth_handler';
import { config } from './config';
import { getLogger } from './lib/logger';
import { getSessionStore } from './lib/session_store';
import { getContextGeneratorMiddleware } from './lib/context';
import { compile } from 'morgan';

const LOG = getLogger('main');

const StravaStrategy = require('passport-strava-oauth2').Strategy;
const webpackMiddleware = require('webpack-dev-middleware');

// TODO: Remove For prod
const webpackConfig = require('../client/config/webpack.config.dev');
const compiler = webpack(webpackConfig);

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Strava profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

const stravaConfig = config.get('strava');

// Use the StravaStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Strava
//   profile), and invoke a callback with a user object.
passport.use(
  new StravaStrategy(
    {
      clientID: stravaConfig.client_id,
      clientSecret: stravaConfig.client_secret,
      callbackURL: `${config.get('root_url')}/auth/strava/callback`,
    },
    (accessToken: any, refreshToken: any, profile: any, done: Function) => {
      LOG.info(`Resolve StravaStrategy`);
      return done(null, profile);
    },
  ),
);

// Exported just for tests.
export async function main() {
  LOG.info('Starting server...');

  const contextMiddleware = await getContextGeneratorMiddleware();

  const app: express.Application = express();
  app.use(morgan('tiny'));
  app.use(contextMiddleware());
  app.use(express.static('./client/build'));
  app.use(cookieParser(config.get('secret')));
  app.use(
    expressSession({
      store: getSessionStore(),
      secret: config.get('secret'),
      saveUninitialized: false,
      resave: false,
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  // TODO: Remove this for prod.
  app.use(
    webpackMiddleware(compiler, {
      publicPath: webpackConfig.output.publicPath,
    }),
  );

  const router = Router();

  router.get(
    '/auth/strava',
    passport.authenticate('strava', { scope: 'view_private' }),
  );
  router.get(
    '/auth/strava/callback',
    passport.authenticate('strava', { failureRedirect: '/' }),
    authHandler.callback,
  );
  app.use(router);

  // TODO: Should we clear the users access token?
  app.get('/logout', authHandler.logout);

  const PORT = config.get('port') as number;

  // Promisify.
  const listenPromise = new Promise<Server>((resolve, reject) => {
    const server = app.listen(PORT, () => {
      LOG.info(`Server started on port ${PORT}.`);
      resolve(server);
    });
  });

  return listenPromise;
}

if (config.get('env') !== 'test') {
  main().catch(error => {
    console.log(error);
    LOG.error(`Failed to start server.`, { error });
  });
}
