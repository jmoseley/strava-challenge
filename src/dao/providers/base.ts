import { ActivityCreateOptions } from '../mongo/activities';
import { User } from '../mongo/users';

export interface ProviderUser {
  providerId: string;
  provider: string;
  displayName: string;
  avatarUrl: string;
}

export interface ProviderActivity extends ActivityCreateOptions {}

// I'm on the fence about the providers needing to know how to get auth information from the user model, but
// it needs to live somewhere :(
export interface BaseProviderDAO {
  getFriends(user: User): Promise<ProviderUser[]>;
  getActivities(user: User, afterDate: Date): Promise<ProviderActivity[]>;
}
