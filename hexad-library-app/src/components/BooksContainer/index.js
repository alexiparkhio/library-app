import React from 'react';
import './styles.sass';
import BookItem from '../BookItem';

function BooksContainer({ user }) {
    return (<>
        <main className="books">
            <div className="books__container">
                <p className="books__header">Available Books</p>
                <input type="text" name="query" className="books__input" placeholder="Type here to search for a book" />

                <ul className="books__list">
                    <BookItem />
                    <BookItem />
                    <BookItem />
                    <BookItem />
                </ul>
            </div>
        </main>
    </>)
}

export default BooksContainer;