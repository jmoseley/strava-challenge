import { ActivityCreateOptions } from '../mongo/activities';

export interface ProviderUser {
  providerId: string;
  provider: string;
  displayName: string;
  avatarUrl: string;
}

export interface ProviderActivity extends ActivityCreateOptions {}

export interface BaseProviderDAO<
  User extends ProviderUser,
  Activity extends ProviderActivity
> {
  getFriends(): Promise<User[]>;
  getActivities(afterDate: Date): Promise<Activity[]>;
}
