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
    log.debug(`Adding friend with userId ${pathParams.id}`);

    await context.daos.user.addFriend(session.user.id, pathParams.id);

    return { redirect: '/friends' };
  },
);
