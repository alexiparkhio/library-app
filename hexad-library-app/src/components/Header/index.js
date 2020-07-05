import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './styles.sass';

function Header({ user, navigation }) {
    return (<>
        <header className="header">
            <div className="header__grid">
                <p className="header__title"><FontAwesomeIcon icon="book" className="icon" onClick={event => {
                    event.preventDefault();
                    navigation('/landing');
                }} />Hexad Library</p>

                {user && (<>
                    <p className="header__welcome">Welcome, Alex!</p>
                    {user.role === 'ADMIN' && <FontAwesomeIcon icon="user-shield" className="header__admin icon"  />}
                    {user.role === 'MEMBER' && <FontAwesomeIcon icon="user" className="user icon" />}
                    <FontAwesomeIcon icon="sign-out-alt" className="logout icon" onClick={event => {
                        event.preventDefault();
                        navigation('/sign-in');
                    }} />
                </>)}

                {!user && (<>
                    <p className="header__welcome">Sign-in/up</p>
                    <FontAwesomeIcon icon="sign-in-alt" className="header__sign-in icon" onClick={event => {
                        event.preventDefault();
                        navigation('/sign-in');
                    }} />
                    <FontAwesomeIcon icon="user-plus" className="header__sign-up icon" onClick={event => {
                        event.preventDefault();
                        navigation('/sign-up');
                    }} />
                </>)}
            </div>
        </header>
    </>)
}

export default Header;