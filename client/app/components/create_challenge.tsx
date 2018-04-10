import * as dapper from '@convoy/dapper';
import * as React from 'react';
import * as moment from 'moment';
import { Quantity } from '@neutrium/quantity';
import { connect } from 'react-redux';

import { Challenge } from '../../../imports/models/challenges';
import CreateChallengeForm from './create_challenge_form';

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

export interface StateProps {
  name: string;
}

export interface Props extends StateProps {}

class CreateChallenge extends React.Component<Props> {
  styles: any = dapper.reactTo(this, STYLES);

  render() {
    return (
      <div className={this.styles.challenge}>
        <h3 className={this.styles.title}>Create Challenge</h3>
        <CreateChallengeForm />
      </div>
    );
  }
}

// Can we type the state?
const mapStateToProps = (state: any) => {
  return {
    name: state.name,
  };
};

export default connect<StateProps>(mapStateToProps)(CreateChallenge);
