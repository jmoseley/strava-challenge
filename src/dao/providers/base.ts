import { ActivityCreateOptions } from '../mongo/activities';

export interface ProviderUser {
  providerId: string;
  provider: string;
  displayName: string;
  avatarUrl: string;
}

export interface ProviderActivity extends ActivityCreateOptions {}

export interface AuthenticatedUser {
  userId: string;
}

export interface BaseProviderDAO<
  AuthUser extends AuthenticatedUser,
  User extends ProviderUser,
  Activity extends ProviderActivity
> {
  getFriends(user: AuthUser): Promise<User[]>;
  getActivities(user: AuthUser, afterDate: Date): Promise<Activity[]>;
}
