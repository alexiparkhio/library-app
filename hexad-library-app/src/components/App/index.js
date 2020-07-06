import React, { useState, useEffect } from 'react';
import '../commons/FontAwesomeIcons';
import { 
  Header, 
  Footer,
  Navbar,
} from '../';
import { 
  MainBody, 
  CredentialsContainer,
} from '../commons';
import { Route, withRouter, Redirect } from 'react-router-dom';
import {
  isUserLoggedIn,

  registerUser,
  authenticateUser,
  retrieveUser,
} from '../../logic';
import context from '../../logic/context';

export default withRouter(function ({ history }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isUserLoggedIn()) {
      retrieveUser()
        .then(user => {
          setUser(user);
          history.push('/home');
        })
    }
  }, []);

  const __handleError__ = message => {
    setError(message);

    setTimeout(() => {
      setError(null);
    }, 3000);
  }

  const logoutHandler = () => {
    delete context.storage.token; 
    delete context.storage.role;
    setUser(null);

    history.push('/sign-in');
  }

  const loginHandler = async (email, password, role) => {
    try {
      await authenticateUser(email, password, role);
      const user = await retrieveUser(role);
      setUser(user);

      history.push('/home');
    } catch ({ message }) {
      __handleError__(message);
    }
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
      <Header user={user} navigation={pageHandler} onLogout={logoutHandler} />
      <MainBody>
        {user && <Navbar user={user} />}
        <Route exact path="/" render={() => isUserLoggedIn() ? <Redirect to="/home" /> : <Redirect to="/sign-in" />} />
        <Route path="/sign-in" render={() => isUserLoggedIn() ? <Redirect to="/home" /> : <CredentialsContainer title="Sign in" button="Log in" navigation={pageHandler} onLogin={loginHandler} error={error} />} />
        <Route path="/sign-up" render={() => isUserLoggedIn() ? <Redirect to="/home" /> : <CredentialsContainer title="Sign up" button="Register" navigation={pageHandler} onRegister={registerHandler} error={error} />} />
        <Route path="/home" render={() => (<></>)} />
      </MainBody>
      <Footer />
    </div>
  </>);
})