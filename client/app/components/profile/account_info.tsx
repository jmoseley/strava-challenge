import * as React from 'react';
import * as _ from 'lodash';
import { Meteor } from 'meteor/meteor';

export interface Props {
  user: Meteor.User;
}

export default class AccountInfo extends React.Component<Props> {
  render() {
    return (
      <div>
        <p>Name: {_.get(this.props.user, 'profile.name')}</p>
        <p>Email: {_.get(this.props.user, 'profile.email')}</p>
      </div>
    );
  }
}
