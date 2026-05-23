import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const EquipmentPage = () => {
    const { user } = useContext(AuthContext);
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [baseFilter, setBaseFilter] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [quantity, setQuantity] = useState('');
    const [baseId, setBaseId] = useState('');

    const [editingId, setEditingId] = useState(null);
    const [editQtyValue, setEditQtyValue] = useState('');

    const fetchEquipment = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/equipment');
            setEquipment(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch equipment data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEquipment();
    }, []);

    const handleAddEquipment = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!name.trim()) return setError('Equipment Name is required.');
        if (!type.trim()) return setError('Equipment Type is required.');
        if (quantity === '' || parseInt(quantity) < 0) {
            return setError('Quantity must be 0 or a positive number.');
        }
        if (!baseId || parseInt(baseId) <= 0) {
            return setError('Please enter a valid Base ID greater than 0.');
        }

        try {
            await api.post('/equipment', {
                name: name.trim(),
                type: type.trim(),
                quantity: parseInt(quantity),
                base_id: parseInt(baseId)
            });
            setSuccess('Equipment added successfully!');
            setName('');
            setType('');
            setQuantity('');
            setBaseId('');
            fetchEquipment();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add equipment.');
        }
    };

    const handleUpdateQty = async (id) => {
        setError('');
        setSuccess('');

        if (editQtyValue === '' || parseInt(editQtyValue) < 0) {
            return setError('Quantity must be 0 or a positive number.');
        }

        try {
            await api.put(`/equipment/${id}`, {
                quantity: parseInt(editQtyValue)
            });
            setSuccess('Quantity updated successfully!');
            setEditingId(null);
            setEditQtyValue('');
            fetchEquipment();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update quantity.');
        }
    };

    const handleDelete = async (id, eqName) => {
        if (!window.confirm(`Are you sure you want to delete ${eqName}?`)) {
            return;
        }

        setError('');
        setSuccess('');
        try {
            await api.delete(`/equipment/${id}`);
            setSuccess('Equipment deleted successfully!');
            fetchEquipment();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete equipment.');
        }
    };

    const filteredEquipment = equipment.filter(item => {
        const matchesSearch = 
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.type.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesType = typeFilter ? item.type.toLowerCase() === typeFilter.toLowerCase() : true;
        const matchesBase = baseFilter ? item.base_id.toString() === baseFilter : true;

        return matchesSearch && matchesType && matchesBase;
    });

    const uniqueTypes = [...new Set(equipment.map(item => item.type))];

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredEquipment.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredEquipment.length / itemsPerPage);

    return (
        <div style={{ fontFamily: 'sans-serif', color: '#1e293b' }}>
            <h2 style={{ marginBottom: '20px' }}>Equipment Inventory Management</h2>

            {error && <div className="error-banner">⚠️ {error}</div>}
            {success && <div className="success-banner">✓ {success}</div>}

            {user.role === 'Admin' && (
                <div className="form-card">
                    <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Add New Equipment</h3>
                    <form onSubmit={handleAddEquipment} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div style={{ flex: '1', minWidth: '150px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. M4 Carbine" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ flex: '1', minWidth: '150px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Type</label>
                            <input type="text" value={type} onChange={e => setType(e.target.value)} placeholder="e.g. Weapon" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ flex: '1', minWidth: '100px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Quantity</label>
                            <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0" min="0" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ flex: '1', minWidth: '100px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Base ID</label>
                            <input type="number" value={baseId} onChange={e => setBaseId(e.target.value)} placeholder="Base ID" min="1" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <button type="submit" style={{ padding: '9px 20px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Add Asset</button>
                    </form>
                </div>
            )}

            <div className="filter-bar">
                <div style={{ flex: '2', minWidth: '200px' }}>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>Search by Name/Type</label>
                    <input type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} placeholder="Search..." style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ flex: '1', minWidth: '130px' }}>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>Filter Type</label>
                    <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1); }} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                        <option value="">All Types</option>
                        {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                {user?.role !== 'BaseCommander' && (
                    <div style={{ flex: '1', minWidth: '130px' }}>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>Filter Base ID</label>
                        <input type="number" value={baseFilter} onChange={e => { setBaseFilter(e.target.value); setCurrentPage(1); }} placeholder="Base ID" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                )}
            </div>

            {loading ? (
                <p>Loading inventory data...</p>
            ) : (
                <div className="table-container">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '15px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '12px 16px' }}>ID</th>
                                <th style={{ padding: '12px 16px' }}>Name</th>
                                <th style={{ padding: '12px 16px' }}>Type</th>
                                <th style={{ padding: '12px 16px' }}>Quantity</th>
                                <th style={{ padding: '12px 16px' }}>Base ID</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No equipment found matching criteria.</td>
                                </tr>
                            ) : (
                                currentItems.map(item => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px 16px' }}>{item.id}</td>
                                        <td style={{ padding: '12px 16px', fontWeight: '500' }}>{item.name}</td>
                                        <td style={{ padding: '12px 16px' }}><span style={{ backgroundColor: '#e2e8f0', padding: '3px 8px', borderRadius: '12px', fontSize: '12px' }}>{item.type}</span></td>
                                        <td style={{ padding: '12px 16px' }}>
                                            {editingId === item.id ? (
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <input type="number" value={editQtyValue} onChange={e => setEditQtyValue(e.target.value)} min="0" style={{ width: '70px', padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }} />
                                                    <button onClick={() => handleUpdateQty(item.id)} style={{ padding: '4px 8px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Save</button>
                                                    <button onClick={() => setEditingId(null)} style={{ padding: '4px 8px', backgroundColor: '#64748b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                    <span>{item.quantity}</span>
                                                    {(user?.role === 'Admin' || user?.role === 'LogisticsOfficer') && (
                                                        <button onClick={() => { setEditingId(item.id); setEditQtyValue(item.quantity); }} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '12px', padding: 0, textDecoration: 'underline' }}>Edit Qty</button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>{item.base_id}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                            {user?.role === 'Admin' ? (
                                                <button onClick={() => handleDelete(item.id, item.name)} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Delete</button>
                                            ) : (
                                                <span style={{ fontSize: '12px', color: '#94a3b8' }}>None</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px', gap: '10px', borderTop: '1px solid #f1f5f9' }}>
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: currentPage === 1 ? '#f1f5f9' : '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>Previous</button>
                            <span style={{ fontSize: '14px' }}>Page <b>{currentPage}</b> of {totalPages}</span>
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: currentPage === totalPages ? '#f1f5f9' : '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>Next</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EquipmentPage;
