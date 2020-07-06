import React, { useState } from 'react';
import './styles.sass';
import BookItem from '../BookItem';

function BooksContainer({ user, books, onRemoveBook }) {
    const [search, setSearch] = useState('');

    function handleSearch(event) {
        event.preventDefault();

        const { target: { value } } = event;
        setSearch(value);
    }

    return (<>
        <main className="books">
            <div className="books__container">
                <p className="books__header">Available Books</p>
                <input type="text" name="query" className="books__input" placeholder="Type here a title to search for a book" onChange={handleSearch} />

                <ul className="books__list">
                    {books.length > 0 ? books.map(book => (<>
                        <BookItem key={book.id} details={book} user={user} input={search} onRemoveBook={onRemoveBook} />
                    </>)) : <p>No books to load...</p>}
                </ul>
            </div>
        </main>
    </>)
}

export default BooksContainer;