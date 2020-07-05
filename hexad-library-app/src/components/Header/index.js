import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './styles.sass';

function Header({ user }) {
    return (<>
        <header className="header">
            <div className="header__grid">
                <p className="header__title"><FontAwesomeIcon icon="book" className="icon" />Hexad Library</p>

                {user && (<>
                    <p className="header__welcome">Welcome, Alex!</p>
                    {user.role === 'ADMIN' && <FontAwesomeIcon icon="user-shield" className="header__admin icon" />}
                    {user.role === 'MEMBER' && <FontAwesomeIcon icon="user" className="user icon" />}
                    <FontAwesomeIcon icon="sign-out-alt" className="logout icon" />
                </>)}

                {!user && (<>
                    <p className="header__welcome">Sign-in/up</p>
                    <FontAwesomeIcon icon="sign-in-alt" className="header__sign-in icon" />
                    <FontAwesomeIcon icon="user-plus" className="header__sign-up icon" />
                </>)}
            </div>
        </header>
    </>)
}

export default Header;