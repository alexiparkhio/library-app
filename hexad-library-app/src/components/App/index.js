import React, { useState, useEffect } from 'react';
import { Header, Footer } from '../';
import '../commons/FontAwesomeIcons';
import { MainBody, CredentialsContainer } from '../commons';
import { Route, withRouter, Redirect } from 'react-router-dom';
import {
  registerUser,
} from '../../logic';

export default withRouter(function({ history }) {
  const [view, setView] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const __handleError__ = message => {
    setError(message);

    setTimeout(() => {
      setError(null);
    }, 3000);
  }

  const loginHandler = (email, password, role) => {
    console.log(email, password, role);
  }

  const registerHandler = async (email, password, role) => {
    try {
     await registerUser(email, password, role);

      history.push('/sign-in');
    } catch ({ message }) {
      __handleError__(message);
    }
  }

  const pageHandler = page => {
    history.push(page);
  }

  return (<>
    <div className="App">
      <Header user={user} navigation={pageHandler} />
      <MainBody>
        <Route exact path="/" render={() => !view ? <Redirect to="/sign-in" /> : <Redirect to="/sign-up" />} />
        <Route path="/sign-in" render={() => <CredentialsContainer title="Sign in" button="Log in" navigation={pageHandler} onLogin={loginHandler} error={error}  />} />
        <Route path="/sign-up" render={() => <CredentialsContainer title="Sign up" button="Register" navigation={pageHandler} onRegister={registerHandler} error={error} />} />
      </MainBody>
      <Footer />
    </div>
  </>);
})