import React, { useState } from 'react';
import './style.sass';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Feedback } from '../';

function CredentialsContainer({ title, button, navigation, onLogin, onRegister, error }) {
    const [userType, setUserType] = useState('MEMBER');

    function submitHandler(event) {
        event.preventDefault();
        
        const {target: { email: { value: email }, password: { value: password } }} = event;

        title === 'Sign up' ? onRegister(email, password, userType) : onLogin(email, password, userType);
    }

    return (<>
        <form className="credentials" onSubmit={submitHandler}>
            {title === "Sign in" && <FontAwesomeIcon icon="sign-in-alt" className="credentials__header icon" />}
            {title === "Sign up" && <FontAwesomeIcon icon="user-plus" className="credentials__header icon" />}
            <p className="credentials__header">{title}</p>
            <div className="credentials__separator"></div>
            <input type="text" name="email" className="credentials__input" placeholder="example@mail.com" required />
            <input type="password" name="password" className="credentials__input" placeholder="Insert your password" required />
            <div className="credentials__profile-container">
                <div className="credentials__profile-item">
                    <FontAwesomeIcon icon="user" className={`credentials__icon icon ${userType === 'MEMBER' ? 'enabled' : ''}`} onClick={() => setUserType('MEMBER')} />
                    <p className="credentials__profile-text">Member</p>
                </div>

                <div className="credentials__profile-item">
                    <FontAwesomeIcon icon="user-shield" className={`credentials__icon icon ${userType === 'ADMIN' ? 'enabled' : ''}`} onClick={() => setUserType('ADMIN')} />
                    <p className="credentials__profile-text">Admin</p>
                </div>
            </div>

            {error && <Feedback feedback={error} />}

            <button type="submit" className="credentials__submit-button">{button}</button>
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
                navigation('/home')}}>Enter as guest</a>
        </form>
    </>)
}

export default CredentialsContainer;