import * as _ from 'lodash';
import * as URL from 'url-parse';
import * as util from 'util';
import { Meteor } from 'meteor/meteor';

import { BaseProviderDAO } from './base';
import { ActivityCreateOptions } from '../../imports/models/activities';

// OMG types....
const strava = require('strava-v3');
// const listFriends = util.promisify(strava.athlete.listFriends);
const listActivities = util.promisify(strava.athlete.listActivities);

export interface User {
  _id: string;
  services: { strava: { accessToken: string } };
}

export default class StravaProviderDAO implements BaseProviderDAO {
  constructor(private user: Meteor.User) {}

  public async getActivities(
    afterDate?: Date,
  ): Promise<ActivityCreateOptions[]> {
    const afterSeconds = afterDate ? afterDate.getTime() / 1000 : null;

    // TODO: Deal with pagination
    const rawActivities: RawStravaActivity[] = await listActivities({
      access_token: this.user.services.strava.accessToken,
      after: afterSeconds,
    });

    console.debug(
      `Found ${rawActivities.length} new activities from strava for user ${
        this.user._id
      }.`,
    );

    return _.map(rawActivities, activity => {
      return this.convertActivity(activity);
    });
  }

  // public async getFriends(user: User): Promise<StravaUser[]> {
  //   const rawFriends: RawStravaUser[] = await listFriends({
  //     access_token: user.accessToken,
  //   });

  //   return _.map(rawFriends, this.convertUser);
  // }

  // private convertUser(rawUser: RawStravaUser): StravaUser {
  //   // Handles default profile images that look like 'avatar/athlete/large.png' or 'avatar/athlete/medium.png'
  //   if (rawUser.profile) {
  //     const profileUrl = URL(rawUser.profile);
  //     if (!profileUrl.hostname) {
  //       rawUser.profile = undefined as any;
  //     }
  //   }

  //   return {
  //     providerId: rawUser.id.toString(),
  //     provider: 'strava',
  //     displayName: `${rawUser.firstname} ${rawUser.lastname}`,
  //     avatarUrl: rawUser.profile,
  //   };
  // }

  private convertActivity(
    rawActivity: RawStravaActivity,
  ): ActivityCreateOptions {
    return {
      userId: this.user._id as string,
      name: rawActivity.name,
      type: rawActivity.type,
      startDate: new Date(rawActivity.start_date),
      movingTime: rawActivity.moving_time,
      totalTime: rawActivity.elapsed_time,
      distance: rawActivity.distance,
      elevation: rawActivity.total_elevation_gain,
      provider: 'strava',
      providerId: rawActivity.id.toString(),
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

interface RawStravaActivity {
  id: number;
  resource_state: number;
  external_id: string;
  upload_id: number;
  athlete: {
    id: number;
    resource_state: number;
  };
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  start_date: string;
  start_date_local: string;
  timezone: string;
  start_latlng: [number, number];
  end_latlng: [number, number];
  achievement_count: number;
  pr_count: number;
  kudos_count: number;
  comment_count: number;
  athlete_count: number;
  photo_count: number;
  total_photo_count: number;
  map: {
    id: string;
    summary_polyline: string;
    resource_state: number;
  };
  trainer: boolean;
  commute: boolean;
  manual: boolean;
  private: boolean;
  flagged: boolean;
  average_speed: number;
  max_speed: number;
  average_watts: number;
  max_watts: number;
  weighted_average_watts: number;
  kilojoules: number;
  device_watts: boolean;
  has_heartrate: boolean;
  average_heartrate: number;
  max_heartrate: number;
}
