import * as dapper from '@convoy/dapper';
import * as React from 'react';
import * as moment from 'moment';
import { Quantity } from '@neutrium/quantity';

import { Activity } from '../../../imports/models/activities';

const STYLES = dapper.compile({
  activity: {
    margin: '0.5em',
  },
  title: {
    margin: 0,
  },
  link: {
    color: 'black',
  },
});

export interface Props {
  activity: Activity;
}

export default class ActivityCard extends React.Component<Props> {
  styles: any = dapper.reactTo(this, STYLES);

  render() {
    const distance: Quantity = new Quantity(
      `${this.props.activity.distance} m`,
    );
    const miles = distance.to('mi').scalar.toFixed(2);

    const duration = moment.duration(this.props.activity.movingTime, 'seconds');

    return (
      <div className={this.styles.activity}>
        <h3 className={this.styles.title}>
          <a
            target="_blank"
            className={this.styles.link}
            href={`https://www.strava.com/activities/${
              this.props.activity.providerId
            }`}
          >
            {this.props.activity.name}
          </a>
        </h3>
        Miles: <span>{miles}</span>
        <br />
        Moving Time:{' '}
        <span>{`${duration.get('hours')}:${duration.get(
          'minutes',
        )}:${duration.get('seconds')}`}</span>
      </div>
    );
  }
}
