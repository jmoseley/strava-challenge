import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';

/**
 * Wrap the default UI component in a React component.
 * https://github.com/meteor/simple-todos-react/commit/60c34e4b9c9b41b6fc998857a49a9427dcf361ce
 *
 * TODO: We will need to roll our own login flow before we launch because Strava has strict rules about
 * styling: https://developers.strava.com/guidelines/
 * https://guide.meteor.com/accounts.html#useraccounts will help.
 */
export default class AccountsUIWrapper extends React.Component {
  componentDidMount() {
    // Use Meteor Blaze to render login buttons
    (this as any).view = Blaze.render(
      Template.loginButtons,
      ReactDOM.findDOMNode(this.refs.container),
    );
  }
  componentWillUnmount() {
    // Clean up Blaze view
    Blaze.remove((this as any).view);
  }
  render() {
    // Just render a placeholder container that will be filled in
    return <span ref="container" />;
  }
}
