import * as _ from 'lodash';
import * as express from 'express';

import { config } from '../config';
import { LoggerInstance } from '../logger';
import StravaProviderDAO from '../dao/providers/strava';

function getSharedTemplateContext(req: any, log: LoggerInstance): any {
  const user = _.get(req, 'session.user');
  if (user) {
    log.debug(`Found user in session.`, { displayName: user.displayName });
  }

  return { user };
}

export async function index(req: any, res: express.Response) {
  const log = req.context.loggerFactory.getLogger('PugHandler.index');

  const context = getSharedTemplateContext(req, log);

  res.render('index', context);
}

// Data layout for friends:
// Friend Request:
// sourceUseId, targetUserId
// When request is accepted, we create a friendship, and delete the request
// Frienship:
// user1Id, user2Id
export async function friends(req: any, res: express.Response) {
  const log = req.context.loggerFactory.getLogger(`PugHander.friends`);
  const context = getSharedTemplateContext(req, log);

  if (!req.session.user) {
    log.debug(`No user in session, redirecting`);
    res.redirect(`/`);
    return;
  }
  const stravaProvider = new StravaProviderDAO(
    req.session.user.accessToken,
    req.context.loggerFactory,
  );
  const stravaFriends = await stravaProvider.getFriends();

  // Parition by friends that are already in the database.
  // Potential friends are friends that are already on the plgatform.
  // Non-potential friends are friends that aren't on the platform yet, and need to be invited.
  // TODO: Eventually we should just create a user object for all these users that we find.

  // Look up all the friends in one query.
  const friendUsers = await req.context.daos.user.findUsers(
    _.map(stravaFriends, f => ({
      provider: f.provider,
      providerId: f.providerId,
    })),
  );
  const [potentialFriends, needInviteFriends] = _.partition(
    stravaFriends,
    stravaFriend => {
      return !!_.find(
        friendUsers,
        friendUser => stravaFriend.providerId === friendUser.providerId,
      );
    },
  );

  // TODO: If there is bi-directional following and the user exists on the platform, we should just create the
  // friendship automatically.

  // TODO: Filter out people that are already friends.
  context.potentialFriends = potentialFriends;
  context.needInviteFriends = needInviteFriends;

  res.render('friends', context);
}
