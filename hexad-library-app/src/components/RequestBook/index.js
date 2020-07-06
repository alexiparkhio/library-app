import React, { useEffect } from 'react';
import './styles.sass';
import { Feedback } from '../commons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function RequestBook({ onRequestBook, feedback }) {
    useEffect(() => {}, [feedback]);

    function onSubmit(event) {
        event.preventDefault();

        const { ISBN: { value: ISBN } } = event.target;
        event.target.ISBN.value = '';

        onRequestBook(ISBN);
    }

    return (<>
        <form className="request" onSubmit={onSubmit}>
            <FontAwesomeIcon icon='light-bulb' className="request__header icon" />
            <p className="request__header">Submit a new book request to the library</p>
            <div className="request__separator"></div>
            <input type="text" name="ISBN" className="request__input" placeholder="Insert the ISBN of the book" required />

            {feedback && <Feedback feedback={feedback} />}

            <button type="submit" className="request__submit-button">Add book to the library</button>
        </form>
    </>)
}

export default RequestBook;