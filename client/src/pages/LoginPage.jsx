import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Admin');
    const [baseId, setBaseId] = useState('');
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            if (isRegister) {
                // Register request
                const payload = {
                    name,
                    email,
                    password,
                    role,
                    base_id: role === 'BaseCommander' && baseId ? parseInt(baseId) : null
                };
                await api.post('/auth/register', payload);
                setSuccess('Registration successful! Please login with your credentials.');
                setIsRegister(false);
                setName('');
                setPassword('');
            } else {
                // Login request
                const response = await api.post('/auth/login', { email, password });
                login(response.data.user, response.data.token);
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Action failed');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'sans-serif' }}>
            <form onSubmit={handleSubmit} style={{ backgroundColor: '#fff', padding: '30px 40px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', width: '380px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#1e293b' }}>
                    {isRegister ? 'Register Account' : 'Sign In'}
                </h2>
                
                {error && <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px', fontWeight: 'bold' }}>⚠️ {error}</div>}
                {success && <div style={{ color: '#059669', backgroundColor: '#d1fae5', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px', fontWeight: 'bold' }}>✓ {success}</div>}
                
                {isRegister && (
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontSize: '14px', color: '#475569', marginBottom: '5px' }}>Full Name</label>
                        <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Doe" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                    </div>
                )}

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '14px', color: '#475569', marginBottom: '5px' }}>Email Address</label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. john@example.com" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '14px', color: '#475569', marginBottom: '5px' }}>Password</label>
                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>

                {isRegister && (
                    <>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontSize: '14px', color: '#475569', marginBottom: '5px' }}>Select Role</label>
                            <select value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#fff' }}>
                                <option value="Admin">Admin</option>
                                <option value="LogisticsOfficer">Logistics Officer</option>
                                <option value="BaseCommander">Base Commander</option>
                            </select>
                        </div>

                        {role === 'BaseCommander' && (
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', fontSize: '14px', color: '#475569', marginBottom: '5px' }}>Assign Base ID</label>
                                <input type="number" required={role === 'BaseCommander'} value={baseId} onChange={e => setBaseId(e.target.value)} placeholder="e.g. 1" min="1" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                            </div>
                        )}
                    </>
                )}

                <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
                    {isRegister ? 'Register' : 'Login'}
                </button>

                <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px', color: '#64748b' }}>
                    {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <span onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess(''); }} style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>
                        {isRegister ? 'Sign In' : 'Sign Up'}
                    </span>
                </p>
            </form>
        </div>
    );
};

export default LoginPage;
