import React from 'react';
import './styles.sass';
import BookItem from '../BookItem';

function Wishlist({ user, onToggleWishlist }) {
    return (<>
        <main className="wishlist">
            <div className="wishlist__container">
                <p className="wishlist__header">Books wishlisted by {user.email}</p>

                <ul className="wishlist__list">
                    {user.wishlistedBooks.length > 0 ? user.wishlistedBooks.map(book => (<>
                       <BookItem key={book.id} details={book} user={user} onToggleWishlist={onToggleWishlist} />
                    </>)) : <p>No books wishlisted</p>}
                </ul>
            </div>
        </main>
    </>)
}

export default Wishlist;