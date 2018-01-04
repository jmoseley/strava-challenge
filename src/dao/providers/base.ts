export interface ProviderUser {
  providerId: string;
  provider: string;
  displayName: string;
  avatarUrl: string;
}

export interface BaseProviderDAO<User extends ProviderUser> {
  getFriends(): Promise<User[]>;
}
