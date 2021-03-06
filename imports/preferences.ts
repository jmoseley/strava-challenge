export enum NOTIFICATION_EVENTS {
  CHALLENGE_INVITE = 'CHALLENGE_INVITE',
  CHALLENGE_ACTIVITY = 'CHALLENGE_ACTIVITY',
}

export const NOTIFICATION_EVENT_NAMES = {
  [NOTIFICATION_EVENTS.CHALLENGE_INVITE]: 'Challenge Invite',
  [NOTIFICATION_EVENTS.CHALLENGE_ACTIVITY]: 'Challenge Activity',
};

export enum NOTIFICATION_TYPES {
  EMAIL = 'EMAIL',
}

export const NOTIFICATION_TYPE_NAMES = {
  [NOTIFICATION_TYPES.EMAIL]: 'Email',
};

export interface SetNotificationPreferencesOptions {
  notificationEvent: NOTIFICATION_EVENTS;
  notificationType: NOTIFICATION_TYPES;
  newValue: boolean;
}
