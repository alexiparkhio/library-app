import React from 'react';
import './styles.sass';

function BookItem() {
    return (<>
        <li className="book">
            <section className="book__item">
                <p className="book__title">La conjura de los necios (Someone, 1984)</p>
                <p className="book__status available">Status: available</p>
                <p className="book__description">Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae dolorem in ducimus? Corporis possimus rem, aliquid cum recusandae ab, nisi voluptatibus dolore quae sunt molestiae expedita labore quo, error reprehenderit!<br />Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi dignissimos soluta repellendus ipsum velit doloremque nesciunt natus quia, cum iure eius consequatur hic? Illum fugit saepe repellendus neque asperiores natus!<br />Lorem ipsum dolor sit, amet consectetur adipisicing elit. Fugit, maiores aut accusamus temporibus ad molestiae modi sequi architecto atque aliquam explicabo quae mollitia, natus sit in magni! Minima, reiciendis hic?</p>
                <p className="book__isbn">ISBN: ISBN934875348979</p>
                <div className="book__separator"></div>
                <div className="book__buttons-container">
                    <div className="book__button-container">
                        <i className="book__button icon fas fa-trash"></i>
                        <p className="book__button-text">Remove this book</p>
                    </div>

                    <div className="book__button-container">
                        <i className="book__button icon fas fa-plus-square"></i>
                        <p className="book__button-text">Update stock</p>
                    </div>

                    <div className="book__button-container">
                        <i className="book__button fas fa-layer-group"></i>
                        <p className="book__button-text">Stock: 5</p>
                    </div>
                </div>
            </section>
        </li>
    </>)
}

export default BookItem;