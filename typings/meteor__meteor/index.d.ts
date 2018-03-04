declare module 'meteor/meteor' {
  namespace Meteor {
    interface User {
      friends?: string[];
    }
  }
}
