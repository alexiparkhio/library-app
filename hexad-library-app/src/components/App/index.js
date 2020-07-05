import React, { useState, useEffect } from 'react';
import { Header, Footer } from '../';
import '../commons/FontAwesomeIcons';
import { MainBody, CredentialsContainer } from '../commons';
import { Route, withRouter, Redirect } from 'react-router-dom';

export default withRouter(function({ history }) {
  const [view, setView] = useState(null);

  const pageHandler = page => {
    history.push(page);
  }

  return (<>
    <div className="App">
      <Header />
      <MainBody>
        <Route exact path="/" render={() => !view ? <Redirect to="/sign-up" /> : <Redirect to="/sign-in" />} />
        <Route path="/sign-in" render={() => <CredentialsContainer title="Sign in" button="Log in" navigation={pageHandler} />} />
        <Route path="/sign-up" render={() => <CredentialsContainer title="Sign up" button="Register" navigation={pageHandler} />} />
      </MainBody>
      <Footer />
    </div>
  </>);
})