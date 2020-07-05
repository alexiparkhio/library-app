import React from 'react';
import './styles.sass';

function MainBody({ children }) {
    return (<>
        <div className="main-body">{children}</div>
    </>)
}

export default MainBody;