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

import {
  ChallengeCreateOptions,
  ChallengeInviteOptions,
} from '../../../imports/models/challenges';
import { Dispatch } from 'redux';

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

export interface FormData {
  email: string;
}

export interface Props {
  challengeId: string;
}

const onSubmit = async (
  values: FormData,
  _dispatch: Dispatch<any>,
  props: Props,
) => {
  // TODO: It would be nice if we could get this type checking for free. Maybe we add types for the Meteor.call method?
  const args: ChallengeInviteOptions = {
    email: values.email,
    challengeId: props.challengeId,
  };
  Meteor.call('challenge.invite', args);
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

const InviteToChallengeForm = ({
  handleSubmit,
}: InjectedFormProps<FormData, Props>) => {
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Field
        label="Email"
        name="email"
        component={renderField}
        validate={validateNotEmpty}
        type="text"
      />
      <button type="submit">Invite</button>
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

export default reduxForm<FormData, Props>({})(InviteToChallengeForm);
