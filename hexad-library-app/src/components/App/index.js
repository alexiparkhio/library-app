import React from 'react';
import Header from '../Header';
import '../commons/FontAwesomeIcons';
import { MainBody, CredentialsContainer } from '../commons';

function App() {
  return (
    <div className="App">
      <Header />
      <MainBody>
        <CredentialsContainer title="Sign in" button="Log in" />
      </MainBody>
    </div>
  );
}

export default App;