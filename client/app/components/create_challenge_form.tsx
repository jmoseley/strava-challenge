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

import { Challenge } from '../../../imports/models/challenges';

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
}

const onSubmit = async (values: FormData) => {
  // Bunch of defaults for now.
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
  console.log('state', state);
  return {
    name: state.name,
  };
};

export default reduxForm({
  form: 'createChallenge',
})(CreateChallengeForm);
