import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './styles.sass';

function Navbar({ user, navigation }) {
    return (<>
        {user && (<>
            <nav className="nav">
                <div className="nav__flex">
                    <div className="nav__header">
                        <p>Options</p>
                    </div>
                    <ul className="nav__list">
                        {user.role === 'ADMIN' && (<>
                            <li className="nav__option" onClick={event => {
                                event.preventDefault();

                                navigation('add-book');
                            }}><FontAwesomeIcon icon='book' />Add Book</li>
                            <li className={`nav__option ${user.requests.length > 0 ? 'new' : ''}`} onClick={event => {
                                event.preventDefault();

                                navigation('requests');
                            }}><FontAwesomeIcon icon='lightbulb' />New requests {user.requests.length > 0 ? (<p className="nav__notification">({user.requests.length} pending)</p>) : null}</li>
                        </>)}

                        {user.role === 'MEMBER' && (<>
                            <li className="nav__option"><FontAwesomeIcon icon='book' />List of borrowed books</li>
                            <li className="nav__option" onClick={event => {
                                event.preventDefault();

                                navigation('wishlist');
                            }}><FontAwesomeIcon icon='star' />List of wishlisted books</li>
                            <li className="nav__option" onClick={event => {
                                event.preventDefault();

                                navigation('request-book');
                            }}><FontAwesomeIcon icon='lightbulb' />Request a new book</li>
                        </>)}
                    </ul>
                </div>
            </nav>
        </>)}
    </>)
}

export default Navbar;