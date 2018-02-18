import * as React from 'react';
import { Block } from './block';

interface IProps {
  opacity: number;
}

export const StatelessComponent = (props: IProps) => {
  return (
    <Block opacity={props.opacity}>
      <h2>Properties:</h2>
      <p>Opacity: {props.opacity.toString()}</p>
    </Block>
  );
};
