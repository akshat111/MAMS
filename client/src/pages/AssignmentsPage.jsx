import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const AssignmentsPage = () => {
    const { user } = useContext(AuthContext);
    const [assignments, setAssignments] = useState([]);
    const [equipmentList, setEquipmentList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [filterBase, setFilterBase] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
    const [personnelName, setPersonnelName] = useState('');
    const [baseId, setBaseId] = useState('');
    const [assignQty, setAssignQty] = useState('');
    const [assignDate, setAssignDate] = useState('');
    const [availableStock, setAvailableStock] = useState(0);

    const fetchAssignments = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {};
            if (filterBase) params.base_id = filterBase;

            const response = await api.get('/assignments', { params });
            setAssignments(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch assignments.');
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
        fetchAssignments();
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

    const handleAddAssignment = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!selectedEquipmentId) return setError('Please select an equipment.');
        if (!personnelName.trim()) return setError('Personnel Name is required.');
        if (assignQty === '' || parseInt(assignQty) <= 0) {
            return setError('Quantity must be greater than 0.');
        }
        if (parseInt(assignQty) > availableStock) {
            return setError(`Insufficient stock. You cannot assign more than available stock (${availableStock} units).`);
        }

        try {
            await api.post('/assignments', {
                equipment_id: parseInt(selectedEquipmentId),
                personnel_name: personnelName.trim(),
                base_id: parseInt(baseId),
                quantity: parseInt(assignQty),
                assigned_date: assignDate || undefined
            });
            setSuccess('Equipment assigned successfully! Available stock decreased.');
            setSelectedEquipmentId('');
            setPersonnelName('');
            setBaseId('');
            setAssignQty('');
            setAssignDate('');
            setAvailableStock(0);
            fetchAssignments();
            fetchEquipment();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to assign equipment.');
        }
    };

    const filteredAssignments = assignments.filter(item => {
        const matchesSearch = 
            item.personnel_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.equipment_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.equipment_type.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAssignments.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div style={{ fontFamily: 'sans-serif', color: '#1e293b' }}>
            <h2 style={{ marginBottom: '20px' }}>Personnel Assignments Management</h2>

            {error && <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '6px', marginBottom: '15px', fontWeight: 'bold' }}>⚠️ {error}</div>}
            {success && <div style={{ padding: '12px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '6px', marginBottom: '15px', fontWeight: 'bold' }}>✓ {success}</div>}

            {(user?.role === 'Admin' || user?.role === 'LogisticsOfficer') && (
                <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Assign Asset to Personnel</h3>
                    <form onSubmit={handleAddAssignment} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
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
                        <div style={{ flex: '2', minWidth: '180px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Personnel Name</label>
                            <input type="text" value={personnelName} onChange={e => setPersonnelName(e.target.value)} placeholder="e.g. Captain Miller" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ flex: '1', minWidth: '90px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Base ID</label>
                            <input type="number" readOnly value={baseId} placeholder="Auto-filled" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#e2e8f0' }} />
                        </div>
                        <div style={{ flex: '1', minWidth: '90px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Quantity</label>
                            <input type="number" value={assignQty} onChange={e => setAssignQty(e.target.value)} min="1" placeholder="Qty" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ flex: '1', minWidth: '130px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Date Assigned</label>
                            <input type="date" value={assignDate} onChange={e => setAssignDate(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <button type="submit" style={{ padding: '9px 20px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Assign Asset</button>
                    </form>
                </div>
            )}

            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap', backgroundColor: '#f1f5f9', padding: '15px', borderRadius: '8px' }}>
                <div style={{ flex: '3', minWidth: '200px' }}>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>Search (Personnel Name / Equipment Name / Type)</label>
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
                <p>Loading assignments history...</p>
            ) : (
                <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '15px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '12px 16px' }}>Assignment ID</th>
                                <th style={{ padding: '12px 16px' }}>Personnel Name</th>
                                <th style={{ padding: '12px 16px' }}>Equipment Name</th>
                                <th style={{ padding: '12px 16px' }}>Type</th>
                                <th style={{ padding: '12px 16px' }}>Quantity</th>
                                <th style={{ padding: '12px 16px' }}>Base ID</th>
                                <th style={{ padding: '12px 16px' }}>Assigned Date</th>
                                <th style={{ padding: '12px 16px' }}>Assigned By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No assignments found matching criteria.</td>
                                </tr>
                            ) : (
                                currentItems.map(item => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px 16px' }}>{item.id}</td>
                                        <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{item.personnel_name}</td>
                                        <td style={{ padding: '12px 16px' }}>{item.equipment_name}</td>
                                        <td style={{ padding: '12px 16px' }}><span style={{ backgroundColor: '#e2e8f0', padding: '3px 8px', borderRadius: '12px', fontSize: '12px' }}>{item.equipment_type}</span></td>
                                        <td style={{ padding: '12px 16px', color: '#e11d48', fontWeight: 'bold' }}>-{item.quantity}</td>
                                        <td style={{ padding: '12px 16px' }}>Base {item.base_id}</td>
                                        <td style={{ padding: '12px 16px' }}>{new Date(item.assigned_date).toLocaleDateString()}</td>
                                        <td style={{ padding: '12px 16px' }}>User ID: {item.assigned_by}</td>
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

export default AssignmentsPage;
