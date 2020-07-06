import React, { useState, useEffect } from 'react';
import './styles.sass';
import BookItem from '../BookItem';

function BooksContainer({ user, books, onRemoveBook, onUpdateStock, onToggleWishlist }) {
    const [search, setSearch] = useState('');

    function handleSearch(event) {
        event.preventDefault();

        const { target: { value } } = event;
        setSearch(value);
    }

    return (<>
        <main className="books">
            <div className={`books__container ${user ? '' : 'extended'}`}>
                <p className="books__header">Available Books</p>
                <input type="text" name="query" className="books__input" placeholder="Type here a title to search for a book" onChange={handleSearch} />

                <ul className="books__list">
                    {books.length > 0 && books.some(book => book.title.toLowerCase().includes(search.toLowerCase())) ? books.map(book => (<>
                        {book.title.toLowerCase().includes(search.toLowerCase()) && (<>
                            <BookItem key={book.id} details={book} user={user} onRemoveBook={onRemoveBook} onUpdateStock={onUpdateStock} onToggleWishlist={onToggleWishlist} />
                        </>)}
                    </>)) : <p>No books to load...</p>}
                </ul>
            </div>
        </main>
    </>)
}

export default BooksContainer;