import * as React from 'react';
import * as _ from 'lodash';
import { Meteor } from 'meteor/meteor';

export interface Props {
  user: Meteor.User;
}

export default class NotificationPreferences extends React.Component<Props> {
  render() {
    return (
      <div>
        <h3>Notification Preferences</h3>
      </div>
    );
  }
}
