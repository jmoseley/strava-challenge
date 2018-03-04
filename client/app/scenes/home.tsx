import * as React from 'react';
import { Meteor } from 'meteor/meteor';
import { connect } from 'react-redux';
// TODO: Meteor is badly typed :(
import { withTracker } from 'meteor/react-meteor-data';
import styled from 'styled-components';

const CoverWrapper = styled.div`
  margin: 0;
  padding: 0;
`;

const Cover = styled.img`
  width: 100%;
`;

import NavBar from '../components/nav_bar';

export interface DataProps {
  currentUser: Meteor.User;
}

export interface StateProps {
  foo: string;
}

export interface Props extends DataProps, StateProps {}

class HomeScene extends React.Component<Props> {
  render() {
    return (
      <div>
        <NavBar />
        {this._renderCover()}
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
}

// POC that the redux connection works.
const mapStateToProps = (state: any) => ({
  foo: 'bar',
});

function dataLoader(): DataProps {
  return {
    currentUser: Meteor.users.findOne({ _id: Meteor.userId() }),
  };
}

export default withTracker(dataLoader)(
  connect<StateProps>(mapStateToProps)(HomeScene),
);
