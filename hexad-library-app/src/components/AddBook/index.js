import React from 'react';
import './styles.sass';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Feedback } from '../commons';

function AddBook({ onAddBook, error }) {
    function onSubmit(event) {
        event.preventDefault();

        const {
            title,
            description,
            author,
            ISBN,
            stock,
            yearOfPublication
        } = event.target;

        const bookData = { title, description, author, ISBN, stock, yearOfPublication };
        for (const detail in bookData) {
            if (typeof bookData[detail] === 'undefined') delete bookData[detail];
            else {
                if (detail === 'stock' || detail === 'yearOfPublication') bookData[detail] = parseInt(bookData[detail].value);
                else bookData[detail] = bookData[detail].value;
            }
        }

        onAddBook(bookData);
    }

    return (<>
        <form className="add-book" onSubmit={onSubmit}>
            <FontAwesomeIcon icon="book" className="add-book__header icon" />
            <p className="add-book__header">Add a new book to the library</p>
            <div className="add-book__separator"></div>
            <input type="text" name="title" className="add-book__input" placeholder="Book Title" required />
            <input type="text" name="ISBN" className="add-book__input" placeholder="ISBN" required />
            <input type="text" name="author" className="add-book__input" placeholder="Author" />
            <input type="number" name="yearOfPublication" className="add-book__input" placeholder="Year of publication" />
            <textarea name="description" className="add-book__input" placeholder="Book description" rows="4" required></textarea>
            <input type="number" name="stock" className="add-book__input" placeholder="Amount of stock" required />

            {error && <Feedback feedback={error} />}

            <button type="submit" className="add-book__submit-button">Add book to the library</button>
        </form>
    </>)
}

export default AddBook;