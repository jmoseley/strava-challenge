import { Mongo } from 'meteor/mongo';

declare module 'meteor/reywood:publish-composite' {
  export function publishComposite(name: string, config: any): void;
}
