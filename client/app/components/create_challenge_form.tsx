import * as dapper from '@convoy/dapper';
import * as React from 'react';
import * as moment from 'moment';
import { Quantity } from '@neutrium/quantity';
import { connect } from 'react-redux';
import {
  Field,
  reduxForm,
  InjectedFormProps,
  WrappedFieldProps,
} from 'redux-form';
import { Promise as MeteorPromise } from 'meteor/promise';
import { Meteor } from 'meteor/meteor';
import * as uuid from 'uuid';

import { ChallengeCreateOptions } from '../../../imports/models/challenges';

const STYLES = dapper.compile({
  challenge: {
    margin: '0.5em',
  },
  title: {
    margin: 0,
  },
  link: {
    color: 'black',
  },
});

const validateNotEmpty = (value: string) =>
  !value ? 'Must enter a value' : null;
const isNumber = (value: string) =>
  !value || isNaN(parseFloat(value)) ? 'Must be a number' : null;

export interface FormData {
  challengeName: string;
  goal: string;
}

const onSubmit = async (values: FormData) => {
  // TODO: It would be nice if we could get this type checking for free. Maybe we add types for the Meteor.call method?
  // Bunch of defaults for now.
  const args: { newChallenge: ChallengeCreateOptions } = {
    newChallenge: {
      name: values.challengeName,
      startDayOfWeek: 0, // Sunday
      durationWeeks: 1, // 1 week,
      repeats: true,
      distanceMiles: parseFloat(values.goal),
    },
  };
  Meteor.call('challenge.create', args);
};

const renderField = ({
  input,
  label,
  type,
  meta: { touched, error, warning },
}: any) => (
  <div>
    <input {...input} placeholder={label} type={type} />
    {touched &&
      ((error && <span>{error}</span>) || (warning && <span>{warning}</span>))}
  </div>
);

const CreateChallengeForm = ({ handleSubmit }: InjectedFormProps) => {
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Field
        label="Challenge Name"
        name="challengeName"
        component={renderField}
        validate={validateNotEmpty}
        type="text"
      />
      <Field
        label="Target Miles"
        name="goal"
        component={renderField}
        validate={[validateNotEmpty, isNumber]}
      />
      <button type="submit">Submit</button>
    </form>
  );
};

// Can we type the state?
const mapStateToProps = (state: any) => {
  return {
    name: state.name,
  };
};

export default reduxForm({
  form: 'createChallenge',
})(CreateChallengeForm);
