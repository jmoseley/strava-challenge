import * as dapper from '@convoy/dapper';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';

// http://www.colourlovers.com/palette/92095/Giant_Goldfish
const STYLES = dapper.compile({
  button: {
    cursor: 'pointer',
    padding: '7px',
    borderRadius: '3px',
    backgroundColor: '#FA6900',
    color: '#FFFFFF',
    fontFamily: `sans-serif`,
  },
});

export interface Props {
  onClick: () => void;
  label: string;
}

export default class Button extends React.Component<Props> {
  styles: any = dapper.reactTo(this, STYLES);

  render() {
    return (
      <div>
        <span onClick={this.props.onClick} className={this.styles.button}>
          {this.props.label}
        </span>
      </div>
    );
  }
}
