import * as dapper from '@convoy/dapper';
import * as React from 'react';
import { Meteor } from 'meteor/meteor';
import { connect } from 'react-redux';
// TODO: Meteor is badly typed :(
import { withTracker } from 'meteor/react-meteor-data';
import styled from 'styled-components';

import NavBar from '../components/nav_bar';
import {
  Activity,
  Collection as ActivitiesCollection,
} from '../../../imports/models/activities';
import ActivityCard from '../components/activity_card';

const CoverWrapper = styled.div`
  margin: 0;
  padding: 0;
`;

const Cover = styled.img`
  width: 100%;
`;

const STYLES = dapper.compile({
  heading: {
    marginTop: '0.2em',
    fontFamily: `'Coiny', sans-serif`,
    fontWeight: 'lighter',
  },
  homepage: {
    padding: '0.5em',
  },
  bg: {
    height: '100%',
  },
});

export interface DataProps {
  currentUser: Meteor.User;
  loading?: boolean;
  recentRides: Activity[];
}

export interface StateProps {
  foo: string;
}

export interface Props extends DataProps, StateProps {}

class HomeScene extends React.Component<Props> {
  styles: any = dapper.reactTo(this, STYLES);

  render() {
    return (
      <div className={this.styles.bg}>
        <NavBar currentUser={this.props.currentUser} />
        {this._renderCover()}
        {this._renderUserData()}
      </div>
    );
  }

  _renderUserData() {
    if (!this.props.currentUser) {
      return null;
    }

    return (
      <div className={this.styles.homepage}>
        <h2 className={this.styles.heading}>Recent Rides</h2>
        <div>{this._renderActivities()}</div>
      </div>
    );
  }

  _renderCover() {
    if (this.props.currentUser) {
      return null;
    }

    return (
      <CoverWrapper>
        <Cover src="/imgs/cover.jpeg" />
      </CoverWrapper>
    );
  }

  _renderActivities() {
    if (this.props.loading) {
      return <div>Loading...</div>;
    }

    return this.props.recentRides.map(activity => {
      return <ActivityCard activity={activity} key={activity._id} />;
    });
  }
}

// POC that the redux connection works.
const mapStateToProps = (state: any) => ({
  foo: 'bar',
});

function dataLoader(): DataProps {
  const activitiesSub = Meteor.subscribe('activities');

  return {
    loading: !activitiesSub.ready(),
    currentUser: Meteor.users.findOne({ _id: Meteor.userId() }),
    recentRides: ActivitiesCollection.find(
      {},
      { sort: { startDate: -1 }, limit: 10 },
    ).fetch(),
  };
}

export default withTracker(dataLoader)(
  connect<StateProps>(mapStateToProps)(HomeScene),
);
