import * as _ from 'lodash';
import * as express from 'express';

import { User } from '../dao/mongo/users';
import { ContextedRequest } from '../lib/context';

// Once this handler gets too big, let's break it out into actions.
export async function callback(
  req: ContextedRequest,
  res: express.Response,
  next: express.NextFunction,
) {
  const log = req.context.loggerFactory.getLogger('AuthHandler.callback');
  log.info(`Callback from oauth`);

  const userFromSession = _.get(req.session, 'passport.user');
  if (userFromSession) {
    // Try to lookup the user first.
    let users: User[] = await req.context.daos.user.findUsers([
      {
        provider: userFromSession.provider,
        providerId: userFromSession.id,
      },
    ]);
    let user: User;
    if (users.length) {
      user = _.head(users) as User;

      log.info(`Found existing user for oauth`, { user });
      user = await req.context.daos.user.updateAccessToken(
        user.id,
        userFromSession.token,
      );
      log.debug(`Finished updating user access token`);
    } else {
      // Successful authentication, save the user, redirect home.
      const createOptions = {
        displayName: userFromSession.displayName,
        accessToken: userFromSession.token,
        provider: userFromSession.provider,
        providerId: userFromSession.id,
      };
      log.info(`Creating user for oauth`, {
        user: _.omit(createOptions, ['accessToken']),
      });
      user = await req.context.daos.user.create(createOptions);
    }
    req.session.user = user;

    res.redirect('/');
  } else {
    // TODO: Nice errors for the user.
    throw new Error(`Did not get a user back.`);
  }
}

export function logout(
  req: ContextedRequest,
  res: express.Response,
  next: express.NextFunction,
) {
  req.logout();
  req.session.destroy(() => {
    res.redirect('/'); //Inside a callback… bulletproof!
  });
}
