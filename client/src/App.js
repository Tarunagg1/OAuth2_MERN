import React, { Fragment } from 'react';
import { Route, Switch } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import Register from './screens/Register';

import './App.css';
import Login from './screens/Login';
import Activate from './screens/Activate.';

function App() {
  return (
    <Fragment>
      <ToastContainer />
      <Switch>
        {/* <Route path="/" exact  /> */}
        <Route path="/register" exact component={Register} />
        <Route path="/login" exact component={Login} />
        <Route path="/users/activate/:token" exact component={Activate} />
      </Switch>
    </Fragment>
  );
}

export default App;
