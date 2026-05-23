import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const PurchasesPage = () => {
    const { user } = useContext(AuthContext);
    const [purchases, setPurchases] = useState([]);
    const [equipmentList, setEquipmentList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [filterDate, setFilterDate] = useState('');
    const [filterBase, setFilterBase] = useState('');
    const [filterType, setFilterType] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
    const [purchaseQty, setPurchaseQty] = useState('');
    const [purchaseDate, setPurchaseDate] = useState('');
    const [associatedBaseId, setAssociatedBaseId] = useState('');

    const fetchPurchases = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {};
            if (filterDate) params.date = filterDate;
            if (filterBase) params.base_id = filterBase;
            if (filterType) params.equipment_type = filterType;

            const response = await api.get('/purchases', { params });
            setPurchases(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch purchases.');
        } finally {
            setLoading(false);
        }
    };

    const fetchEquipment = async () => {
        try {
            const res = await api.get('/equipment');
            setEquipmentList(res.data);
        } catch (err) {
            console.error('Failed to load equipment list for dropdown:', err);
        }
    };

    useEffect(() => {
        fetchPurchases();
    }, [filterDate, filterBase, filterType]);

    useEffect(() => {
        if (user?.role === 'Admin' || user?.role === 'LogisticsOfficer') {
            fetchEquipment();
        }
    }, [user]);

    const handleEquipmentChange = (e) => {
        const eqId = e.target.value;
        setSelectedEquipmentId(eqId);
        if (eqId) {
            const eq = equipmentList.find(item => item.id.toString() === eqId);
            if (eq) {
                setAssociatedBaseId(eq.base_id);
            }
        } else {
            setAssociatedBaseId('');
        }
    };

    const handleAddPurchase = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!selectedEquipmentId) return setError('Please select an equipment.');
        if (purchaseQty === '' || parseInt(purchaseQty) <= 0) {
            return setError('Quantity must be greater than 0.');
        }
        if (!associatedBaseId) return setError('Base ID is missing.');

        try {
            await api.post('/purchases', {
                equipment_id: parseInt(selectedEquipmentId),
                base_id: parseInt(associatedBaseId),
                quantity: parseInt(purchaseQty),
                purchase_date: purchaseDate || undefined
            });
            setSuccess('Purchase recorded successfully! Equipment stock increased.');
            setSelectedEquipmentId('');
            setPurchaseQty('');
            setPurchaseDate('');
            setAssociatedBaseId('');
            fetchPurchases();
            fetchEquipment();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to record purchase.');
        }
    };

    const filteredPurchases = purchases.filter(item => {
        const matchesSearch = 
            item.equipment_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.equipment_type.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPurchases.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);

    return (
        <div style={{ fontFamily: 'sans-serif', color: '#1e293b' }}>
            <h2 style={{ marginBottom: '20px' }}>Purchases Management</h2>

            {error && <div className="error-banner">⚠️ {error}</div>}
            {success && <div className="success-banner">✓ {success}</div>}

            {(user?.role === 'Admin' || user?.role === 'LogisticsOfficer') && (
                <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Record New Purchase</h3>
                    <form onSubmit={handleAddPurchase} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div style={{ flex: '2', minWidth: '220px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Select Equipment</label>
                            <select value={selectedEquipmentId} onChange={handleEquipmentChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                                <option value="">-- Choose Equipment --</option>
                                {equipmentList.map(eq => (
                                    <option key={eq.id} value={eq.id}>
                                        {eq.name} (Type: {eq.type}, Base: {eq.base_id}, Current Stock: {eq.quantity})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div style={{ flex: '1', minWidth: '100px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Base ID</label>
                            <input type="number" readOnly value={associatedBaseId} placeholder="Auto-filled" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#e2e8f0' }} />
                        </div>
                        <div style={{ flex: '1', minWidth: '100px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Quantity</label>
                            <input type="number" value={purchaseQty} onChange={e => setPurchaseQty(e.target.value)} min="1" placeholder="Qty" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ flex: '1', minWidth: '150px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Purchase Date</label>
                            <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <button type="submit" style={{ padding: '9px 20px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Record Purchase</button>
                    </form>
                </div>
            )}

            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap', backgroundColor: '#f1f5f9', padding: '15px', borderRadius: '8px' }}>
                <div style={{ flex: '2', minWidth: '200px' }}>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>Search (Equipment Name/Type)</label>
                    <input type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} placeholder="Search..." style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ flex: '1', minWidth: '120px' }}>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>Filter Date</label>
                    <input type="date" value={filterDate} onChange={e => { setFilterDate(e.target.value); setCurrentPage(1); }} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ flex: '1', minWidth: '120px' }}>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>Filter Type</label>
                    <input type="text" value={filterType} onChange={e => { setFilterType(e.target.value); setCurrentPage(1); }} placeholder="e.g. Weapon" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                {user?.role !== 'BaseCommander' && (
                    <div style={{ flex: '1', minWidth: '100px' }}>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>Filter Base ID</label>
                        <input type="number" value={filterBase} onChange={e => { setFilterBase(e.target.value); setCurrentPage(1); }} placeholder="Base ID" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                )}
            </div>

            {loading ? (
                <p>Loading purchases history...</p>
            ) : (
                <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '15px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '12px 16px' }}>Purchase ID</th>
                                <th style={{ padding: '12px 16px' }}>Equipment Name</th>
                                <th style={{ padding: '12px 16px' }}>Type</th>
                                <th style={{ padding: '12px 16px' }}>Quantity</th>
                                <th style={{ padding: '12px 16px' }}>Base ID</th>
                                <th style={{ padding: '12px 16px' }}>Purchase Date</th>
                                <th style={{ padding: '12px 16px' }}>Recorded By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No purchases found matching criteria.</td>
                                </tr>
                            ) : (
                                currentItems.map(item => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px 16px' }}>{item.id}</td>
                                        <td style={{ padding: '12px 16px', fontWeight: '500' }}>{item.equipment_name}</td>
                                        <td style={{ padding: '12px 16px' }}><span style={{ backgroundColor: '#e2e8f0', padding: '3px 8px', borderRadius: '12px', fontSize: '12px' }}>{item.equipment_type}</span></td>
                                        <td style={{ padding: '12px 16px', color: '#10b981', fontWeight: 'bold' }}>+{item.quantity}</td>
                                        <td style={{ padding: '12px 16px' }}>{item.base_id}</td>
                                        <td style={{ padding: '12px 16px' }}>{new Date(item.purchase_date).toLocaleDateString()}</td>
                                        <td style={{ padding: '12px 16px' }}>User ID: {item.created_by}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                </div>
            )}
        </div>
    );
};

export default PurchasesPage;
