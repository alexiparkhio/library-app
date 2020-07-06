import React from 'react';
import './styles.sass';
import BookItem from '../BookItem';

function BooksContainer({ user, books }) {
    return (<>
        <main className="books">
            <div className="books__container">
                <p className="books__header">Available Books</p>
                <input type="text" name="query" className="books__input" placeholder="Type here to search for a book" />

                <ul className="books__list">
                    {books.length > 0 ? books.map(book => (<>
                        <BookItem key={book.id} details={book} user={user} />
                    </>)): <p>No books to load...</p>}
                </ul>
            </div>
        </main>
    </>)
}

export default BooksContainer;