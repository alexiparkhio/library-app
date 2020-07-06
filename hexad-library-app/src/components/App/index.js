import React, { useState, useEffect } from 'react';
import '../commons/FontAwesomeIcons';
import {
  Header,
  Footer,
  Navbar,
  BooksContainer,
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

  retrieveBooks,
} from '../../logic';
import context from '../../logic/context';

export default withRouter(function ({ history }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [books, setBooks] = useState();

  useEffect(() => {
    if (isUserLoggedIn()) {
      retrieveUser()
        .then(user => {
          setUser(user);

          return retrieveBooks();
        })
        .then(books => {
          setBooks(books);

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

      const books = await retrieveBooks();
      setBooks(books);

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
        <Route exact path="/" render={() => isUserLoggedIn() ? <Redirect to="/home" /> : <Redirect to="/sign-in" />} />
        <Route path="/sign-in" render={() => isUserLoggedIn() ? <Redirect to="/home" /> : <CredentialsContainer title="Sign in" button="Log in" navigation={pageHandler} onLogin={loginHandler} error={error} />} />
        <Route path="/sign-up" render={() => isUserLoggedIn() ? <Redirect to="/home" /> : <CredentialsContainer title="Sign up" button="Register" navigation={pageHandler} onRegister={registerHandler} error={error} />} />
        {books ? (<>
          {user ? <Navbar user={user} /> : null}
          <Route path="/home" render={() => (<>
            <BooksContainer user={user} books={books} />
          </>)} />
        </>) : null}

      </MainBody>
      <Footer />
    </div>
  </>);
})