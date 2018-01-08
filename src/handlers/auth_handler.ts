import * as _ from 'lodash';
import * as express from 'express';

import { User } from '../dao/mongo/users';
import { ContextedRequest, RequestContext } from '../lib/context';
import { requestHandler } from './base';

// Once this handler gets too big, let's break it out into actions.
export const callback = requestHandler(
  true,
  async (context: RequestContext, session: Express.Session) => {
    const log = context.loggerFactory.getLogger('AuthHandler.callback');
    log.info(`Callback from oauth`);

    const userFromSession = _.get(session, 'passport.user');
    if (userFromSession) {
      // Try to lookup the user first.
      let users: User[] = await context.daos.user.findUsers([
        {
          provider: userFromSession.provider,
          providerId: userFromSession.id.toString(),
        },
      ]);
      let user: User;
      if (users.length) {
        user = _.head(users) as User;

        log.info(`Found existing user for oauth`, { user });
        user = await context.daos.user.updateAccessToken(
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
          providerId: userFromSession.id.toString(),
        };
        log.info(`Creating user for oauth`, {
          user: _.omit(createOptions, ['accessToken']),
        });
        user = await context.daos.user.create(createOptions);
      }
      session.user = user;

      return { redirect: '/' };
    } else {
      // TODO: Nice errors for the user.
      throw new Error(`Did not get a user back.`);
    }
  },
);

export function logout(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  req.logout();
  if (req.session) {
    req.session.destroy(() => {
      res.redirect('/'); //Inside a callback… bulletproof!
    });
  }
}
