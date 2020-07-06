import React from 'react';
import './style.sass';
import moment from 'moment';

function BorrowedItem({ details: { bookId: { ISBN, title }, daysCount, expiracyDate }, onReturnBook }) {
    return (<>
        <li className="borrowed-item">
            <section className="borrowed-item__item">
                <p className="borrowed-item__title">ISBN: {ISBN}</p>
                <p className="borrowed-item__text">Book: "{title}"</p>
                <p className="borrowed-item__text">Available until: {moment(expiracyDate).format('DD/MM/YYYY, HH:mm')} ({daysCount} days since borrowed)</p>

                <div className="borrowed-item__separator"></div>

                <p className="borrowed-item__return-button icon" onClick={event => {
                    event.preventDefault();

                    onReturnBook(ISBN);
                }}>Return book</p>
            </section>
        </li>
    </>)
}

export default BorrowedItem;