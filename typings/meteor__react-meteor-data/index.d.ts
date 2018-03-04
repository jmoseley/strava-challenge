import { Component } from 'react';

declare module 'meteor/react-meteor-deata' {
  export function withTracker<DataProps>(
    dataLoader: () => DataProps,
  ): (baseComponent: Component) => Component;
}
