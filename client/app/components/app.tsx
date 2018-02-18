import * as React from 'react';
import { Accounts } from 'meteor/std:accounts-ui';

const App = () => {
  return (
    <div>
      <h1>Cycle Challenge</h1>
      <Accounts.ui.LoginForm />
    </div>
  );
};

export default App;
