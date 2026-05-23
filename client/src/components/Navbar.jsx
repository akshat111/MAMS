import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="navbar">
            <h3>Military Asset Management System</h3>
            <div>
                <span>Welcome, <b>{user?.name}</b></span>
            </div>
        </div>
    );
};

export default Navbar;
