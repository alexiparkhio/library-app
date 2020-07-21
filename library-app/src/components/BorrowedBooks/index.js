import React from 'react';
import './styles.sass';
import BorrowedItem from '../BorrowedItem';
import { Feedback } from '../commons';

function BorrowedBooks({ user, feedback, onReturnBook }) {
    return (<>
        <main className="borrowed-books">
            <div className="borrowed-books__container">
                <p className="borrowed-books__header">Books borrowed by {user.email}</p>
                <p className="borrowed-books__text">Accumulated days of overdue penalty: {user.overdueDays}</p>

                {feedback && <Feedback feedback={feedback} />}

                <ul className="borrowed-books__list">
                    {user.borrowedBooks.length > 0 ? user.borrowedBooks.map(book => (<>
                        <BorrowedItem details={book} user={user} onReturnBook={onReturnBook} />
                    </>)) : <p>No books borrowed. You can still borrow up to {user.borrowLimit - user.borrowedBooks.length} books</p>}
                </ul>
            </div>
        </main>
    </>)
}

export default BorrowedBooks;