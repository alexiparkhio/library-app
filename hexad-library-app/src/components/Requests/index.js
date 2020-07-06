import React from 'react';
import './styles.sass';
import RequestItem from '../RequestItem';

function Requests({ user: { requests } }) {
    return (<>
        <div className="requests">
            <div className="requests__container">
                <p className="requests__header">Pending requests</p>

                <ul className="requests__list">
                    {requests.length > 0 ? requests.map(request => (<>
                        <RequestItem request={request} />
                    </>)): <p>No current pending requests</p>}
                </ul>
            </div>
        </div>
    </>)
}

export default Requests;