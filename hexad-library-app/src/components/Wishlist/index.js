import React from 'react';
import './styles.sass';
import BookItem from '../BookItem';
import { Feedback } from '../commons';

function Wishlist({ user, onToggleWishlist, onBorrowBook, feedback }) {
    return (<>
        <main className="wishlist">
            <div className="wishlist__container">
                <p className="wishlist__header">Books wishlisted by {user.email}</p>

                {feedback && <Feedback feedback={feedback} />}

                <ul className="wishlist__list">
                    {user.wishlistedBooks.length > 0 ? user.wishlistedBooks.map(book => (<>
                        <BookItem key={book.id} details={book} user={user} onToggleWishlist={onToggleWishlist} onBorrowBook={onBorrowBook} />
                    </>)) : <p>No books wishlisted</p>}
                </ul>
            </div>
        </main>
    </>)
}

export default Wishlist;