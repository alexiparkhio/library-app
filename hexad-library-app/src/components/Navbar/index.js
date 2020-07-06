import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './styles.sass';

function Navbar({ user, onAddBook }) {
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

                                onAddBook();
                            }}><FontAwesomeIcon icon='book' />Add Book</li>
                            <li className="nav__option"><FontAwesomeIcon icon='book-dead' />Remove Book</li>
                            <li className="nav__option"><FontAwesomeIcon icon='lightbulb' />New requests</li>
                        </>)}

                        {user.role === 'MEMBER' && (<>
                            <li className="nav__option"><FontAwesomeIcon icon='book' />List of borrowed books</li>
                            <li className="nav__option"><FontAwesomeIcon icon='star' />List of wishlisted books</li>
                            <li className="nav__option"><FontAwesomeIcon icon='lightbulb' />Request a new book</li>
                        </>)}
                    </ul>
                </div>
            </nav>
        </>)}
    </>)
}

export default Navbar;