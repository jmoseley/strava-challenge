import * as _ from 'lodash';
import * as URL from 'url-parse';
import * as util from 'util';

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
    // Handles default profile images that look like 'avatar/athlete/large.png' or 'avatar/athlete/medium.png'
    if (rawUser.profile) {
      const profileUrl = URL(rawUser.profile);
      if (!profileUrl.hostname) {
        rawUser.profile = undefined as any;
      }
    }

    return {
      providerId: rawUser.id.toString(),
      provider: 'strava',
      displayName: `${rawUser.firstname} ${rawUser.lastname}`,
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
