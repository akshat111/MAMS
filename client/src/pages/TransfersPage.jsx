import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const TransfersPage = () => {
    const { user } = useContext(AuthContext);
    const [transfers, setTransfers] = useState([]);
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
    const [fromBaseId, setFromBaseId] = useState('');
    const [toBaseId, setToBaseId] = useState('');
    const [transferQty, setTransferQty] = useState('');
    const [transferDate, setTransferDate] = useState('');
    const [availableStock, setAvailableStock] = useState(0);

    const fetchTransfers = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {};
            if (filterDate) params.date = filterDate;
            if (filterBase) params.base_id = filterBase;
            if (filterType) params.equipment_type = filterType;

            const response = await api.get('/transfers', { params });
            setTransfers(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch transfers.');
        } finally {
            setLoading(false);
        }
    };

    const fetchEquipment = async () => {
        try {
            const res = await api.get('/equipment');
            setEquipmentList(res.data);
        } catch (err) {
            console.error('Failed to load equipment list:', err);
        }
    };

    useEffect(() => {
        fetchTransfers();
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
                setFromBaseId(eq.base_id);
                setAvailableStock(eq.quantity);
            }
        } else {
            setFromBaseId('');
            setAvailableStock(0);
        }
    };

    const handleAddTransfer = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!selectedEquipmentId) return setError('Please select an equipment to transfer.');
        if (!toBaseId || parseInt(toBaseId) <= 0) return setError('Please enter a valid destination Base ID.');
        if (parseInt(fromBaseId) === parseInt(toBaseId)) {
            return setError('Source base and destination base cannot be the same.');
        }
        if (transferQty === '' || parseInt(transferQty) <= 0) {
            return setError('Quantity must be greater than 0.');
        }
        if (parseInt(transferQty) > availableStock) {
            return setError(`Insufficient stock. You cannot transfer more than available stock (${availableStock} units).`);
        }

        try {
            await api.post('/transfers', {
                equipment_id: parseInt(selectedEquipmentId),
                from_base_id: parseInt(fromBaseId),
                to_base_id: parseInt(toBaseId),
                quantity: parseInt(transferQty),
                transfer_date: transferDate || undefined
            });
            setSuccess('Transfer completed successfully! Stocks updated across bases.');
            setSelectedEquipmentId('');
            setFromBaseId('');
            setToBaseId('');
            setTransferQty('');
            setTransferDate('');
            setAvailableStock(0);
            fetchTransfers();
            fetchEquipment();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to complete transfer.');
        }
    };

    const filteredTransfers = transfers.filter(item => {
        const matchesSearch = 
            item.equipment_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.equipment_type.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredTransfers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredTransfers.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div style={{ fontFamily: 'sans-serif', color: '#1e293b' }}>
            <h2 style={{ marginBottom: '20px' }}>Stock Transfers Management</h2>

            {error && <div className="error-banner">⚠️ {error}</div>}
            {success && <div className="success-banner">✓ {success}</div>}

            {(user?.role === 'Admin' || user?.role === 'LogisticsOfficer') && (
                <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Initiate Stock Transfer</h3>
                    <form onSubmit={handleAddTransfer} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div style={{ flex: '2', minWidth: '220px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Select Equipment to Transfer</label>
                            <select value={selectedEquipmentId} onChange={handleEquipmentChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                                <option value="">-- Choose Equipment --</option>
                                {equipmentList.map(eq => (
                                    <option key={eq.id} value={eq.id}>
                                        {eq.name} (Type: {eq.type}, Base: {eq.base_id}, Available: {eq.quantity})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div style={{ flex: '1', minWidth: '90px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>From Base</label>
                            <input type="number" readOnly value={fromBaseId} placeholder="Auto-filled" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#e2e8f0' }} />
                        </div>
                        <div style={{ flex: '1', minWidth: '90px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>To Base ID</label>
                            <input type="number" value={toBaseId} onChange={e => setToBaseId(e.target.value)} min="1" placeholder="Dest Base" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ flex: '1', minWidth: '90px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Quantity</label>
                            <input type="number" value={transferQty} onChange={e => setTransferQty(e.target.value)} min="1" placeholder="Qty" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ flex: '1', minWidth: '130px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Transfer Date</label>
                            <input type="date" value={transferDate} onChange={e => setTransferDate(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <button type="submit" style={{ padding: '9px 20px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Transfer Stock</button>
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

            <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '15px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '12px 16px' }}>Transfer ID</th>
                                <th style={{ padding: '12px 16px' }}>Equipment Name</th>
                                <th style={{ padding: '12px 16px' }}>Type</th>
                                <th style={{ padding: '12px 16px' }}>Quantity</th>
                                <th style={{ padding: '12px 16px' }}>From Base</th>
                                <th style={{ padding: '12px 16px' }}>To Base</th>
                                <th style={{ padding: '12px 16px' }}>Transfer Date</th>
                                <th style={{ padding: '12px 16px' }}>Transferred By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No transfers found matching criteria.</td>
                                </tr>
                            ) : (
                                currentItems.map(item => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px 16px' }}>{item.id}</td>
                                        <td style={{ padding: '12px 16px', fontWeight: '500' }}>{item.equipment_name}</td>
                                        <td style={{ padding: '12px 16px' }}><span style={{ backgroundColor: '#e2e8f0', padding: '3px 8px', borderRadius: '12px', fontSize: '12px' }}>{item.equipment_type}</span></td>
                                        <td style={{ padding: '12px 16px', color: '#3b82f6', fontWeight: 'bold' }}>{item.quantity}</td>
                                        <td style={{ padding: '12px 16px' }}>Base {item.from_base_id}</td>
                                        <td style={{ padding: '12px 16px' }}>Base {item.to_base_id}</td>
                                        <td style={{ padding: '12px 16px' }}>{new Date(item.transfer_date).toLocaleDateString()}</td>
                                        <td style={{ padding: '12px 16px' }}>User ID: {item.transferred_by}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px', gap: '10px', borderTop: '1px solid #f1f5f9' }}>
                            <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: currentPage === 1 ? '#f1f5f9' : '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>Previous</button>
                            <span style={{ fontSize: '14px' }}>Page <b>{currentPage}</b> of {totalPages}</span>
                            <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: currentPage === totalPages ? '#f1f5f9' : '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>Next</button>
                        </div>
                    )}
                </div>
        </div>
    );
};

export default TransfersPage;
