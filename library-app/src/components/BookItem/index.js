import React, { useState, useEffect } from 'react';
import './styles.sass';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Feedback } from '../commons';

function BookItem({ onToggleWishlist, onUpdateStock, user, details: { title, author, description, yearOfPublication, ISBN, stock }, onRemoveBook, onBorrowBook, feedback }) {
    const [restock, setRestock] = useState(false);
    const [newStock, setNewStock] = useState();

    useEffect(() => { }, [user]);

    function newStockHandler(event) {
        const { target: { value } } = event;

        setNewStock(parseInt(value));
    }

    return (<>
        <li className="book">
            <section className="book__item">
                <p className="book__title">{title} ({author ? author : ''}, {yearOfPublication ? yearOfPublication : ''})</p>
                <p className={`book__status ${stock > 0 ? 'available' : 'unavailable'}`}>Status: {stock > 0 ? 'available' : 'out of stock'}</p>
                <p className="book__description">{description ? description : 'No description provided'}</p>
                <p className="book__isbn">ISBN: {ISBN}</p>
                <div className="book__separator"></div>

                <div className="book__buttons-container">
                    {user && (<>
                        {user.role === 'ADMIN' && (<>
                            <div className="book__button-container">
                                <FontAwesomeIcon icon="trash" className="book__button icon" onClick={event => {
                                    event.preventDefault();

                                    onRemoveBook(ISBN);
                                }} />
                                <p className="book__button-text">Remove this book</p>
                            </div>

                            <div className="book__button-container">
                                <FontAwesomeIcon icon="plus-square" className="book__button icon" onClick={() => setRestock(!restock)} />
                                <p className="book__button-text">Update stock</p>
                                {restock && (<>
                                    <div className="book__restock-amount">
                                        <p className="book__restock-text">Amount:</p>
                                        <div className="book__restock-buttons">
                                            <input type='number' min='0' name="stock" className="book__input" onChange={newStockHandler} />

                                            <FontAwesomeIcon icon="plus-square" className="book__restock-text icon" onClick={event => {
                                                event.preventDefault();

                                                onUpdateStock({ stock: newStock, ISBN, title });
                                            }} />
                                        </div>
                                    </div>
                                </>)}
                            </div>

                            <div className="book__button-container">
                                <FontAwesomeIcon icon="layer-group" className="book__button icon" />
                                <p className="book__button-text">Stock: {stock}</p>
                            </div>
                        </>)}

                        {user.role === 'MEMBER' && (<>
                            <div className={`book__button-container ${stock === 0 ? 'disabled' : ''}`}>
                                <FontAwesomeIcon icon="star" className={`book__button icon ${typeof user.wishlistedBooks.find(book => book.ISBN === ISBN) !== 'undefined' ? 'wishlisted' : ''}`} onClick={event => {
                                    event.preventDefault();

                                    onToggleWishlist(ISBN);
                                }} />
                                <p className="book__button-text">{typeof user.wishlistedBooks.find(book => book.ISBN === ISBN) !== 'undefined' ? 'Unwishlist this book' : 'Wishlist this book'}</p>
                            </div>

                            <div className={`book__button-container ${stock === 0 || typeof user.borrowedBooks.find(book => book.bookId.ISBN === ISBN) !== 'undefined' ? 'disabled' : ''}`}>
                                <FontAwesomeIcon icon="atlas" className="book__button icon" onClick={event => {
                                    event.preventDefault();

                                    onBorrowBook(ISBN);
                                }} />
                                <p className="book__button-text">{typeof user.borrowedBooks.find(book => book.bookId.ISBN === ISBN) !== 'undefined' ? 'Book already borrowed' : 'Borrow this book'} ({user.borrowLimit - user.borrowedBooks.length} remaining)</p>
                            </div>

                            <div className="book__button-container">
                                <FontAwesomeIcon icon="layer-group" className="book__button icon" />
                                <p className="book__button-text">Stock: {stock}</p>
                            </div>
                        </>)}
                    </>)}

                    {!user && (<>
                        <div className="book__button-container disabled">
                            <FontAwesomeIcon icon="star" className="book__button icon" />
                            <p className="book__button-text">Wishlist this book</p>
                        </div>

                        <div className="book__button-container disabled">
                            <FontAwesomeIcon icon="atlas" className="book__button icon" />
                            <p className="book__button-text">Borrow this book</p>
                        </div>

                        <div className="book__button-container disabled">
                            <FontAwesomeIcon icon="layer-group" className="book__button icon" />
                            <p className="book__button-text">Stock: {stock}</p>
                        </div>
                    </>)}
                </div>
            </section>
        </li>
    </>)
}

export default BookItem;