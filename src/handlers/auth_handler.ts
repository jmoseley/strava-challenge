import * as _ from 'lodash';

import UserDAO from "../dao/users";

// Once this handler gets too big, let's break it out into actions.
export async function callback(req: any, res: any, next: any) {
  const log = req.context.loggerFactory.getLogger('AuthHandler.callback');
  log.info(`Callback from oauth`);

  const userFromSession = _.get(req.session, 'passport.user');
  if (userFromSession) {
    const userDao = new UserDAO(req.context.loggerFactory, req.context.db);

    // Try to lookup the user first.
    let user = await userDao.findUser(userFromSession.provider, userFromSession.id);
    if (user) {
      log.info(`Found existing user for oauth`, { user });
    } else {
      // Successful authentication, save the user, redirect home.
      const createOptions = {
        displayName: userFromSession.displayName,
        accessToken: userFromSession.token,
        provider: userFromSession.provider,
        providerId: userFromSession.id,
      };
      log.info(`Creating user for oauth`, { user: createOptions });
      user = await userDao.create(createOptions);
    }
    req.session.user = user;

    res.redirect('/');
  } else {
    // TODO: Nice errors for the user.
    throw new Error(`Did not get a user back.`);
  }
}

export function logout(req: any, res: any) {
  req.logout();
  req.session.destroy(() => {
    res.redirect('/'); //Inside a callback… bulletproof!
  });
}
