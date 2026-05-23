import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="sidebar">
            <h2>Military Asset</h2>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>Logged in as: <b>{user.name} ({user?.role})</b></p>
            <hr style={{ borderColor: '#334155' }} />
            <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ margin: '15px 0' }}><Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>📊 Dashboard</Link></li>
                <li style={{ margin: '15px 0' }}><Link to="/equipment" style={{ color: '#fff', textDecoration: 'none' }}>📦 Equipment Inventory</Link></li>

                {user?.role !== 'BaseCommander' && (
                    <li style={{ margin: '15px 0' }}><Link to="/purchases" style={{ color: '#fff', textDecoration: 'none' }}>🛒 Purchases</Link></li>
                )}

                <li style={{ margin: '15px 0' }}><Link to="/transfers" style={{ color: '#fff', textDecoration: 'none' }}>🔄 Transfers</Link></li>
                <li style={{ margin: '15px 0' }}><Link to="/assignments" style={{ color: '#fff', textDecoration: 'none' }}>🎖️ Assignments</Link></li>
                <li style={{ margin: '15px 0' }}><Link to="/expenditures" style={{ color: '#fff', textDecoration: 'none' }}>⚠️ Expenditures</Link></li>
            </ul>
            <button onClick={handleLogout} style={{ marginTop: '30px', padding: '8px 16px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Logout
            </button>
        </div>
    );
};

export default Sidebar;
