import React, { useState, useEffect } from 'react';
import '../commons/FontAwesomeIcons';
import {
  Header,
  Footer,
  Navbar,
  BooksContainer,
  AddBook,
  RequestBook,
  Requests,
  Wishlist,
  BorrowedBooks,
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
  toggleWishlist,

  addBooks,
  removeBook,
  retrieveBooks,
  requestBook,
  borrowBook,
  returnBorrowedBook,
} from '../../logic';
import context from '../../logic/context';

export default withRouter(function ({ history }) {
  const [user, setUser] = useState(null);
  const [feedback, setFeedback] = useState(null);
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

  const __handleFeedback__ = (message, level) => {
    setFeedback({ message, level });

    setTimeout(() => {
      setFeedback(null);
    }, 3000);
  }

  const __updateBooksList__ = async () => {
    const books = await retrieveBooks();
    setBooks(books);
  }

  const __updateUser__ = async () => {
    const user = await retrieveUser();
    setUser(user);
  }

  const logoutHandler = () => {
    delete context.storage.token;
    delete context.storage.role;
    setView('books');
    setUser(null);

    history.push('/sign-in');
  }

  const loginHandler = async (email, password, role) => {
    try {
      await authenticateUser(email, password, role);
      const user = await retrieveUser();
      setUser(user);
      setView('books');

      await __updateBooksList__();

      history.push('/home');
    } catch ({ message }) {
      __handleFeedback__(message, 'error');
    }
  }

  const registerHandler = async (email, password, role) => {
    try {
      await registerUser(email, password, role);

      history.push('/sign-in');
    } catch ({ message }) {
      __handleFeedback__(message, 'error');
    }
  }

  const pageHandler = page => {
    history.push(page);
  }

  const screenHandler = screen => {
    setView(screen)
  }

  const onGoHomeHandler = () => {
    setView('books');
    history.push('/home');
  }

  const addBookHandler = async (bookData) => {
    try {
      await addBooks(bookData);

      await __updateBooksList__();
      await __updateUser__();
      setView('books');

    } catch ({ message }) {
      __handleFeedback__(message, 'error');
    }
  }

  const removeBookHandler = async (ISBN) => {
    try {
      await removeBook(ISBN);

      __updateBooksList__();
    } catch ({ message }) {
      __handleFeedback__(message, 'error');
    }
  }

  const toggleWishlistHandler = async (ISBN) => {
    try {
      await toggleWishlist(ISBN);

      await __updateUser__();
    } catch ({ message }) {
      __handleFeedback__(message, 'error');
    }
  }

  const requestBookHandler = async (ISBN) => {
    try {
      await requestBook(ISBN);
      __handleFeedback__('Request successfully received!', 'success');

    } catch ({ message }) {
      __handleFeedback__('This book has already been requested by you!', 'error');
    }
  }

  const borrowBookHandler = async (ISBN) => {
    try {
      await borrowBook(ISBN);
      await __updateUser__();
      await __updateBooksList__();
      
      __handleFeedback__('Book has been borrowed! Check your list to see the days until overdue', 'success')
    } catch ({ message }) {
      __handleFeedback__('Oops! Something went wrong', 'error');
    }
  }
  
  const returnBorrowedBookHandler = async (ISBN) => {
    try {
      await returnBorrowedBook(ISBN);
      await __updateUser__();
      await __updateBooksList__();
    } catch ({ message }) {
      __handleFeedback__(message, 'error');
    }
  }

  return (<>
    <div className="App">
      <Header user={user} navigation={pageHandler} onLogout={logoutHandler} onGoHome={onGoHomeHandler} />
      <MainBody>
        <Route exact path="/" render={() => isUserLoggedIn() ? <Redirect to="/home" /> : <Redirect to="/sign-in" />} />
        <Route path="/sign-in" render={() => isUserLoggedIn() ? <Redirect to="/home" /> : <CredentialsContainer title="Sign in" button="Log in" navigation={pageHandler} onLogin={loginHandler} error={feedback} />} />
        <Route path="/sign-up" render={() => isUserLoggedIn() ? <Redirect to="/home" /> : <CredentialsContainer title="Sign up" button="Register" navigation={pageHandler} onRegister={registerHandler} error={feedback} />} />
        {books ? (<>
          {user ? <Navbar user={user} navigation={screenHandler} /> : null}
          <Route path="/home" render={() => (<>
            {view === 'books' && <BooksContainer user={user} books={books} onRemoveBook={removeBookHandler} onUpdateStock={addBookHandler} onToggleWishlist={toggleWishlistHandler} onBorrowBook={borrowBookHandler} feedback={feedback} />}
            {view === 'add-book' && <AddBook onAddBook={addBookHandler} />}
            {view === 'request-book' && <RequestBook onRequestBook={requestBookHandler} feedback={feedback} />}
            {view === 'requests' && <Requests user={user} />}
            {view === 'wishlist' && <Wishlist user={user} onToggleWishlist={toggleWishlistHandler} onBorrowBook={borrowBookHandler} feedback={feedback} />}
            {view === 'borrowed' && <BorrowedBooks user={user} feedback={feedback} onReturnBook={returnBorrowedBookHandler} />}
          </>)} />
        </>) : null}
      </MainBody>
      <Footer />
    </div>
  </>);
})