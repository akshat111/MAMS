import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const ExpendituresPage = () => {
    const { user } = useContext(AuthContext);
    const [expenditures, setExpenditures] = useState([]);
    const [equipmentList, setEquipmentList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [filterBase, setFilterBase] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
    const [baseId, setBaseId] = useState('');
    const [expendQty, setExpendQty] = useState('');
    const [reason, setReason] = useState('');
    const [expendDate, setExpendDate] = useState('');
    const [availableStock, setAvailableStock] = useState(0);

    const fetchExpenditures = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {};
            if (filterBase) params.base_id = filterBase;

            const response = await api.get('/expenditures', { params });
            setExpenditures(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch expenditures.');
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
        fetchExpenditures();
    }, [filterBase]);

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
                setBaseId(eq.base_id);
                setAvailableStock(eq.quantity);
            }
        } else {
            setBaseId('');
            setAvailableStock(0);
        }
    };

    const handleAddExpenditure = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!selectedEquipmentId) return setError('Please select an equipment.');
        if (!reason.trim()) return setError('Reason for expenditure is required.');
        if (expendQty == '' || parseInt(expendQty) <= 0) {
            return setError('Quantity must be greater than 0.');
        }
        if (parseInt(expendQty) > availableStock) {
            return setError(`Insufficient stock. You cannot expend more than available stock (${availableStock} units).`);
        }

        try {
            await api.post('/expenditures', {
                equipment_id: parseInt(selectedEquipmentId),
                base_id: parseInt(baseId),
                quantity: parseInt(expendQty),
                reason: reason.trim(),
                expended_date: expendDate || undefined
            });
            setSuccess('Asset expenditure recorded successfully! Available stock decreased.');
            setSelectedEquipmentId('');
            setBaseId('');
            setExpendQty('');
            setReason('');
            setExpendDate('');
            setAvailableStock(0);
            fetchExpenditures();
            fetchEquipment();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to record expenditure.');
        }
    };

    const filteredExpenditures = expenditures.filter(item => {
        const matchesSearch = 
            item.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.equipment_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.equipment_type.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredExpenditures.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredExpenditures.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div style={{ fontFamily: 'sans-serif', color: '#1e293b' }}>
            <h2 style={{ marginBottom: '20px' }}>Expenditures Log Management</h2>

            {error && <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '6px', marginBottom: '15px', fontWeight: 'bold' }}>⚠️ {error}</div>}
            {success && <div style={{ padding: '12px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '6px', marginBottom: '15px', fontWeight: 'bold' }}>✓ {success}</div>}

            {(user?.role === 'Admin' || user?.role === 'LogisticsOfficer') && (
                <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Record Expended Asset</h3>
                    <form onSubmit={handleAddExpenditure} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div style={{ flex: '2', minWidth: '220px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Select Equipment</label>
                            <select value={selectedEquipmentId} onChange={handleEquipmentChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                                <option value="">-- Choose Equipment --</option>
                                {equipmentList.map(eq => (
                                    <option key={eq.id} value={eq.id}>
                                        {eq.name} (Type: {eq.type}, Base: {eq.base_id}, Available: {eq.quantity})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div style={{ flex: '2', minWidth: '150px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Reason / Description</label>
                            <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Combat damage, Worn out" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ flex: '1', minWidth: '90px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Base ID</label>
                            <input type="number" readOnly value={baseId} placeholder="Auto-filled" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#e2e8f0' }} />
                        </div>
                        <div style={{ flex: '1', minWidth: '90px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Quantity</label>
                            <input type="number" value={expendQty} onChange={e => setExpendQty(e.target.value)} min="1" placeholder="Qty" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ flex: '1', minWidth: '130px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Date Expended</label>
                            <input type="date" value={expendDate} onChange={e => setExpendDate(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <button type="submit" style={{ padding: '9px 20px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Record Waste</button>
                    </form>
                </div>
            )}

            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap', backgroundColor: '#f1f5f9', padding: '15px', borderRadius: '8px' }}>
                <div style={{ flex: '3', minWidth: '200px' }}>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>Search (Reason / Equipment / Type)</label>
                    <input type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} placeholder="Search..." style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                {user?.role !== 'BaseCommander' && (
                    <div style={{ flex: '1', minWidth: '130px' }}>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>Filter Base ID</label>
                        <input type="number" value={filterBase} onChange={e => { setFilterBase(e.target.value); setCurrentPage(1); }} placeholder="Base ID" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                )}
            </div>

            {loading ? (
                <p>Loading expenditures history...</p>
            ) : (
                <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '15px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '12px 16px' }}>Expenditure ID</th>
                                <th style={{ padding: '12px 16px' }}>Equipment Name</th>
                                <th style={{ padding: '12px 16px' }}>Type</th>
                                <th style={{ padding: '12px 16px' }}>Quantity</th>
                                <th style={{ padding: '12px 16px' }}>Reason</th>
                                <th style={{ padding: '12px 16px' }}>Base ID</th>
                                <th style={{ padding: '12px 16px' }}>Expended Date</th>
                                <th style={{ padding: '12px 16px' }}>Recorded By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No expenditures found matching criteria.</td>
                                </tr>
                            ) : (
                                currentItems.map(item => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px 16px' }}>{item.id}</td>
                                        <td style={{ padding: '12px 16px', fontWeight: '500' }}>{item.equipment_name}</td>
                                        <td style={{ padding: '12px 16px' }}><span style={{ backgroundColor: '#e2e8f0', padding: '3px 8px', borderRadius: '12px', fontSize: '12px' }}>{item.equipment_type}</span></td>
                                        <td style={{ padding: '12px 16px', color: '#ef4444', fontWeight: 'bold' }}>-{item.quantity}</td>
                                        <td style={{ padding: '12px 16px', color: '#64748b', fontStyle: 'italic' }}>"{item.reason}"</td>
                                        <td style={{ padding: '12px 16px' }}>Base {item.base_id}</td>
                                        <td style={{ padding: '12px 16px' }}>{new Date(item.expended_date).toLocaleDateString()}</td>
                                        <td style={{ padding: '12px 16px' }}>User ID: {item.created_by}</td>
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
            )}
        </div>
    );
};

export default ExpendituresPage;
