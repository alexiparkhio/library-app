import React from 'react';
import './style.sass';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function CredentialsContainer({ title, button, navigation }) {
    return (<>
        <form class="credentials">
            {title === "Sign in" && <FontAwesomeIcon icon="sign-in-alt" className="credentials__header icon" />}
            {title === "Sign up" && <FontAwesomeIcon icon="user-plus" className="credentials__header icon" />}
            <p class="credentials__header">{title}</p>
            <div class="credentials__separator"></div>
            <input type="text" name="email" class="credentials__input" placeholder="example@mail.com" required />
            <input type="password" name="password" class="credentials__input" placeholder="Insert your password" required />
            <div class="credentials__profile-container">
                <div class="credentials__profile-item">
                    <FontAwesomeIcon icon="user" className="credentials__icon icon" />
                    <p class="credentials__profile-text">Member</p>
                </div>

                <div class="credentials__profile-item">
                    <FontAwesomeIcon icon="user-shield" className="credentials__icon icon" />
                    <p class="credentials__profile-text">Admin</p>
                </div>
            </div>
            <button type="submit" class="credentials__submit-button">{button}</button>
            {title === "Sign in" && <a href="" onClick={event => {
                event.preventDefault();
                navigation('/sign-up')
                }}>Not a member? Sign up</a>}
            {title === "Sign up" && <a href="" onClick={event => {
                event.preventDefault();
                navigation('/sign-in')
                }}>Already a member? Sign in</a>}
            <a href="" onClick={event => {
                event.preventDefault();
                navigation('/landing')}}>Enter as guest</a>
        </form>
    </>)
}

export default CredentialsContainer;