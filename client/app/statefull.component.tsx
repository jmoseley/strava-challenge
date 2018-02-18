import * as React from 'react';
import { Block } from './block.component';

interface IProps {
  opacity: number;
}

interface IState {
  hovered: boolean;
  clicked: number;
}

export class StatefullComponent extends React.Component<IProps, IState> {
  static defaultProps: IProps = {
    opacity: 0.8,
  };

  constructor(props: IProps) {
    super(props);

    this.state = {
      hovered: false,
      clicked: 0,
    };

    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  onMouseEnter() {
    this.setState({
      hovered: true,
    });
  }

  onMouseLeave() {
    this.setState({
      hovered: false,
    });
  }

  onClick() {
    this.setState({
      clicked: this.state.clicked + 1,
    });
  }

  render() {
    return (
      <Block
        opacity={this.props.opacity}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        onClick={this.onClick}
        activeOnHover
      >
        <h2>Properties</h2>
        <p>Opacity: {this.props.opacity.toString()}</p>
        <h2>State</h2>
        <p>Hovered: {this.state.hovered.toString()}</p>
        <p>Clicked: {this.state.clicked.toString()}</p>
      </Block>
    );
  }
}
