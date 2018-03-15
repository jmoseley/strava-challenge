import * as dapper from '@convoy/dapper';
import * as React from 'react';
import * as moment from 'moment';
import { Quantity } from '@neutrium/quantity';

import { Challenge } from '../../../imports/models/challenges';

const STYLES = dapper.compile({
  challenge: {
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
  challenge: Challenge;
}

export default class ChallengeCard extends React.Component<Props> {
  styles: any = dapper.reactTo(this, STYLES);

  render() {
    return (
      <div className={this.styles.challenge}>
        <h3 className={this.styles.title}>{this.props.challenge.name}</h3>
        <span>{this.props.challenge.distanceMiles} miles</span>
      </div>
    );
  }
}
