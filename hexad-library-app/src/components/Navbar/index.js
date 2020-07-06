import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './styles.sass';

function Navbar({ user: { role } }) {
    return (<>
        <nav class="nav">
            <div class="nav__flex">
                <div class="nav__header">
                    <p>Options</p>
                </div>
                <ul class="nav__list">
                    {role === 'ADMIN' && (<>
                        <li class="nav__option"><FontAwesomeIcon icon='book' />Add Book</li>
                        <li class="nav__option"><FontAwesomeIcon icon='book-dead' />Remove Book</li>
                        <li class="nav__option"><FontAwesomeIcon icon='lightbulb' />New requests</li>
                    </>)}

                    {role === 'MEMBER' && (<>
                        <li class="nav__option"><FontAwesomeIcon icon='book' />List of borrowed books</li>
                        <li class="nav__option"><FontAwesomeIcon icon='star' />List of wishlisted books</li>
                        <li class="nav__option"><FontAwesomeIcon icon='lightbulb' />Request a new book</li>
                    </>)}
                </ul>
            </div>
        </nav>
    </>)
}

export default Navbar;