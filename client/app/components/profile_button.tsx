import * as React from 'react';
import { WithRouterProps, withRouter } from 'react-router';

import Button from './button';

export interface Props {}

class ProfileButton extends React.Component<Props & WithRouterProps> {
  render() {
    return <Button onClick={this._onClick.bind(this)} label="Profile" />;
  }

  _onClick() {
    this.props.router.push('/profile');
  }
}

export default withRouter(ProfileButton);
