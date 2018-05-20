import {
  NOTIFICATION_EVENTS,
  NOTIFICATION_TYPES,
} from '../../imports/preferences';

declare module 'meteor/meteor' {
  namespace Meteor {
    interface User {
      preferences: User.Preferences;
    }

    namespace User {
      interface Preferences {
        notifications?: {
          [key: string]: NOTIFICATION_TYPES[];
        };
      }
    }
  }
}
