import { requestHandler } from './base';
import { RequestContext } from '../lib/context';

export const addFriend = requestHandler(
  true,
  async (
    context: RequestContext,
    session: Express.Session,
    pathParams: { id?: string },
  ) => {
    const log = context.loggerFactory.getLogger(`FriendHandler.addFriend`);
    if (!pathParams.id) {
      throw new Error(`A userId must be specified.`);
    }
    log.debug(`Adding friend for userId ${pathParams.id}`);

    const friendUser = await context.daos.user.findById(pathParams.id);
    if (!friendUser) {
      // TODO: 404
      throw new Error(`Cannot add friend that does not exist.`);
    }
    await context.daos.user.addFriend(session.user.id, friendUser.id);

    return { redirect: '/friends' };
  },
);
