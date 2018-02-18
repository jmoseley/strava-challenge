import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Template.hello.onCreated(function helloOnCreated(): void {
  // counter starts at 0
  this.counter = new ReactiveVar(0);
});

Template.hello.helpers({
  counter(): number {
    return Template.instance().counter.get();
  },
});

Template.hello.events({
  'click button'(event: any, instance: any): void {
    // increment the counter when button is clicked
    instance.counter.set(instance.counter.get() + 1);
  },
});
