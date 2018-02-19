import {
  Activity,
  ActivityCreateOptions,
} from '../../imports/models/activities';

// I'm on the fence about the providers needing to know how to get auth information from the user model, but
// it needs to live somewhere :(
export interface BaseProviderDAO {
  // getFriends(user: User): Promise<PUser[]>;
  getActivities(afterDate: Date): Promise<ActivityCreateOptions[]>;
}
