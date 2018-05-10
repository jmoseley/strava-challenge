import * as React from 'react';
import * as _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_EVENTS,
  NOTIFICATION_EVENT_NAMES,
  NOTIFICATION_TYPE_NAMES,
} from '../../../../imports/preferences';

export interface Props {
  user: Meteor.User;
}

export default class NotificationPreferences extends React.Component<Props> {
  // Set default values/
  componentWillReceiveProps(nextProps: Props) {
    if (!nextProps.user) {
      return;
    }
    if (!_.get(nextProps.user, 'preferences.notifications')) {
      if (!_.get(nextProps.user, 'preferences')) {
        nextProps.user.preferences = {} as Meteor.User.Preferences;
      }
      nextProps.user.preferences.notifications = {
        [NOTIFICATION_EVENTS.CHALLENGE_INVITE]: [NOTIFICATION_TYPES.EMAIL],
        [NOTIFICATION_EVENTS.CHALLENGE_ACTIVITY]: [NOTIFICATION_TYPES.EMAIL],
      };
    }
  }
  render() {
    return (
      <div>
        <h3>Notification Preferences</h3>
        {/* TODO: Iterate through the list of NOTIFICATION_EVENTS so that this list will be generated automatically when we extend the list of notification events or notification types */}
        <NotificationEvent
          notificationEvent={NOTIFICATION_EVENTS.CHALLENGE_INVITE}
          currentPreferences={_.get(
            this.props.user,
            `preferences.notifications.${NOTIFICATION_EVENTS.CHALLENGE_INVITE}`,
            [],
          )}
          onChange={_.partial(
            this._updatePreference.bind(this),
            NOTIFICATION_EVENTS.CHALLENGE_INVITE,
          )}
        />
        <NotificationEvent
          notificationEvent={NOTIFICATION_EVENTS.CHALLENGE_ACTIVITY}
          currentPreferences={_.get(
            this.props.user,
            `preferences.notifications.${
              NOTIFICATION_EVENTS.CHALLENGE_ACTIVITY
            }`,
            [],
          )}
          onChange={_.partial(
            this._updatePreference.bind(this),
            NOTIFICATION_EVENTS.CHALLENGE_ACTIVITY,
          )}
        />
      </div>
    );
  }

  _updatePreference(
    notificationEvent: NOTIFICATION_EVENTS,
    notificationType: NOTIFICATION_TYPES,
    value: boolean,
  ) {
    console.log('updatePreference', notificationEvent, notificationType, value);
  }
}

class NotificationEvent extends React.Component<{
  notificationEvent: NOTIFICATION_EVENTS;
  currentPreferences: NOTIFICATION_TYPES[];
  onChange: (notificationType: NOTIFICATION_TYPES, value: boolean) => void;
}> {
  render() {
    return (
      <div>
        <h4>{NOTIFICATION_EVENT_NAMES[this.props.notificationEvent]}</h4>
        {/* TODO: Iterate through the list of NOTIFICATION_TYPES so that this list will be generated automatically when we extend the list of notification events or notification types */}
        <NotificationField
          notificationEvent={this.props.notificationEvent}
          notificationType={NOTIFICATION_TYPES.EMAIL}
          selected={_.includes(
            this.props.currentPreferences,
            NOTIFICATION_TYPES.EMAIL,
          )}
          onChange={this._onChange.bind(this)}
        />
      </div>
    );
  }

  _onChange(notificationType: NOTIFICATION_TYPES, value: boolean) {
    this.props.onChange(notificationType, value);
  }
}

class NotificationField extends React.Component<{
  notificationEvent: NOTIFICATION_EVENTS;
  notificationType: NOTIFICATION_TYPES;
  selected?: boolean;
  onChange: (notificationType: NOTIFICATION_TYPES, value: boolean) => void;
}> {
  render() {
    return (
      <div>
        <label
          htmlFor={`${this.props.notificationType}-${
            this.props.notificationEvent
          }`}
        >
          {NOTIFICATION_TYPE_NAMES[this.props.notificationType]}
        </label>
        <input
          type="checkbox"
          checked={this.props.selected}
          id={`${this.props.notificationType}-${this.props.notificationEvent}`}
          name={this.props.notificationEvent}
          value={this.props.notificationType}
          onChange={this._onChange.bind(this)}
        />
      </div>
    );
  }

  _onChange(event: any) {
    this.props.onChange(this.props.notificationType, event.target.checked);
  }
}
