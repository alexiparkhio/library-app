import React, { useState } from 'react';
import './styles.sass';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import book from '../../../../hexad-library-server/node_modules/hexad-library-data/models/book';

function BookItem({ onUpdateStock, input, user, details: { title, author, description, yearOfPublication, ISBN, stock }, onRemoveBook }) {
    const [restock, setRestock] = useState(false);
    const [newStock, setNewStock] = useState();

    function newStockHandler (event) {
        const { target: {value} } = event;

        setNewStock(parseInt(value));
    }

    return (<>
        {title.toLowerCase().includes(input.toLowerCase()) && (<>
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
                                                } } />
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
                                    <FontAwesomeIcon icon="star" className="book__button icon" />
                                    <p className="book__button-text">Wishlist this book</p>
                                </div>

                                <div className={`book__button-container ${stock === 0 ? 'disabled' : ''}`}>
                                    <FontAwesomeIcon icon="atlas" className="book__button icon" />
                                    <p className="book__button-text">Borrow this book</p>
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
        </>)}
    </>)
}

export default BookItem;