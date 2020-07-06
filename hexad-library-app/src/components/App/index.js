import React, { useState, useEffect } from 'react';
import '../commons/FontAwesomeIcons';
import {
  Header,
  Footer,
  Navbar,
  BooksContainer,
  AddBook,
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

  addBooks,
  removeBook,
  retrieveBooks,
} from '../../logic';
import context from '../../logic/context';
import book from 'hexad-library-data/models/book';

export default withRouter(function ({ history }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [books, setBooks] = useState();
  const [view, setView] = useState('books');

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
    } else {
      retrieveBooks()
        .then(books => setBooks(books))
    }
  }, []);

  const __handleError__ = message => {
    setError(message);

    setTimeout(() => {
      setError(null);
    }, 3000);
  }

  const __updateBooksList__ = async () => {
    const books = await retrieveBooks();
    setBooks(books);
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

      await __updateBooksList__();

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

  const onAddBook = () => {
    setView('add-book')
  }

  const onGoHomeHandler = () => {
    setView('books');
    history.push('/home');
  }

  const addBookHandler = async (bookData) => {
    try {
      await addBooks(bookData);

      await __updateBooksList__();
      setView('books');

    } catch ({ message }) {
      __handleError__(message);
    }
  }

  const removeBookHandler = async (ISBN) => {
    try {
      await removeBook(ISBN);

      __updateBooksList__();
    } catch ({ message }) {
      __handleError__(message);
    }
  }

  return (<>
    <div className="App">
      <Header user={user} navigation={pageHandler} onLogout={logoutHandler} onGoHome={onGoHomeHandler} />
      <MainBody>
        <Route exact path="/" render={() => isUserLoggedIn() ? <Redirect to="/home" /> : <Redirect to="/sign-in" />} />
        <Route path="/sign-in" render={() => isUserLoggedIn() ? <Redirect to="/home" /> : <CredentialsContainer title="Sign in" button="Log in" navigation={pageHandler} onLogin={loginHandler} error={error} />} />
        <Route path="/sign-up" render={() => isUserLoggedIn() ? <Redirect to="/home" /> : <CredentialsContainer title="Sign up" button="Register" navigation={pageHandler} onRegister={registerHandler} error={error} />} />
        {books ? (<>
          {user ? <Navbar user={user} onAddBook={onAddBook} /> : null}
          <Route path="/home" render={() => (<>
            {view === 'books' && <BooksContainer user={user} books={books} onRemoveBook={removeBookHandler} />}
            {view === 'add-book' && <AddBook onAddBook={addBookHandler} />}
          </>)} />
        </>) : null}

      </MainBody>
      <Footer />
    </div>
  </>);
})