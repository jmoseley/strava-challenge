import * as _ from 'lodash';
import * as util from 'util';

import BaseMongoDAO from '../mongo/base';
import { BaseProviderDAO, ProviderUser } from './base';
import { WithLog, LoggerFactory } from '../../logger';

// OMG types....
const strava = require('strava-v3');
const listFriends = util.promisify(strava.athlete.listFriends);

export interface StravaUser extends ProviderUser {}

export default class StravaProviderDAO extends WithLog
  implements BaseProviderDAO<StravaUser> {
  constructor(
    private readonly accessToken: string,
    loggerFactory: LoggerFactory,
  ) {
    super(loggerFactory);
  }

  public async getFriends(): Promise<StravaUser[]> {
    const rawFriends: RawStravaUser[] = await listFriends({
      access_token: this.accessToken,
    });

    return _.map(rawFriends, this.convertUser);
  }

  private convertUser(rawUser: RawStravaUser): StravaUser {
    return {
      providerId: rawUser.id.toString(),
      provider: 'strava',
      displayName:
        rawUser.username || `${rawUser.firstname} ${rawUser.lastname}`,
      avatarUrl: rawUser.profile,
    };
  }
}

interface RawStravaUser {
  id: number;
  username?: string;
  resource_state: number;
  firstname: string;
  lastname: string;
  city: string;
  state: string;
  country: string;
  sex: string;
  premium: boolean;
  created_at: string;
  updated_at: string;
  badge_type_id: number;
  profile_medium: string;
  profile: string;
  friend: string;
  follower: string;
}
