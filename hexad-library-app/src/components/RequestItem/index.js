import React from 'react';
import './style.sass';

function RequestItem({ request: { requester: { email }, ISBN } }) {
    return (<>
        <li className="request">
            <section className="request__item">
                <p className="request__title">ISBN: {ISBN}</p>
                <div className="request__separator"></div>
                <p className="request__requester">Requested by: {email}</p>
            </section>
        </li>
    </>)
}

export default RequestItem;