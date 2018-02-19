import * as React from 'react';

import { Activity } from '../../../imports/models/activities';

export interface Props {
  activity: Activity;
}

export default class ActivityCard extends React.Component<Props> {
  render() {
    return (
      <div>
        <span>{this.props.activity.name}</span> ({this.props.activity.type})
      </div>
    );
  }
}
