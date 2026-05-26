import { useState, useEffect } from 'react';
import api from '../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [date, setDate] = useState('');
    const [base, setBase] = useState('');
    const [equipmentType, setEquipmentType] = useState('');
    const [modalData, setModalData] = useState(null);
    const [modalTitle, setModalTitle] = useState('');

    const fetchStats = async () => {
        try {
            const response = await api.get(`/dashboard`, {
                params: { date, base, equipment_type: equipmentType }
            });
            setStats(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [date, base, equipmentType]);

    const handleOpenModal = async (type, title) => {
        try {
            const res = await api.get(`/dashboard/details/${type}`, {
                params: { date, base, equipment_type: equipmentType }
            });
            setModalData(res.data);
            setModalTitle(title);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCloseModal = () => {
        setModalData(null);
        setModalTitle('');
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN'); // Returns DD/MM/YYYY format
    };

    const cardStyle = {
        flex: '1', minWidth: '180px', backgroundColor: '#fff', padding: '20px', borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer', textAlign: 'center', margin: '10px'
    };

    return (
        <div>
            <h2>Dashboard Overview</h2>

            <div style={{ display: 'flex', gap: '15px', margin: '20px 0', flexWrap: 'wrap' }}>
                <div>
                    <label>Filter Date: </label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div>
                    <label>Filter Base ID: </label>
                    <input type="number" placeholder="Base ID" value={base} onChange={e => setBase(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div>
                    <label>Filter Type: </label>
                    <input type="text" placeholder="e.g. Weapon" value={equipmentType} onChange={e => setEquipmentType(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
            </div>

            {stats && (
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', margin: '20px -10px' }}>
                    <div className="card">
                        <h3>Opening Balance</h3>
                        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.openingBalance}</p>
                    </div>
                    <div className="card">
                        <h3>Closing Balance</h3>
                        <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{stats.closingBalance}</p>
                    </div>
                    <div className="card">
                        <h3>Net Movement</h3>
                        <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>{stats.netMovement}</p>
                    </div>
                    <div style={{ ...cardStyle, backgroundColor: '#eff6ff' }} onClick={() => handleOpenModal('purchases', 'Purchases Details')}>
                        <h3>Purchases</h3>
                        <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>{stats.purchases}</p>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>Click to view details</span>
                    </div>
                    <div style={{ ...cardStyle, backgroundColor: '#ecfdf5' }} onClick={() => handleOpenModal('transfers-in', 'Transfers In Details')}>
                        <h3>Transfer In</h3>
                        <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>{stats.transferIn}</p>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>Click to view details</span>
                    </div>
                    <div style={{ ...cardStyle, backgroundColor: '#fff5f5' }} onClick={() => handleOpenModal('transfers-out', 'Transfers Out Details')}>
                        <h3>Transfer Out</h3>
                        <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>{stats.transferOut}</p>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>Click to view details</span>
                    </div>
                </div>
            )}

            {modalData && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3>{modalTitle}</h3>
                            <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left' }}>
                                    <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>ID</th>
                                    <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>Asset</th>
                                    <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>Type</th>
                                    <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>Qty</th>
                                    <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {modalData.map(item => (
                                    <tr key={item.id}>
                                        <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{item.id}</td>
                                        <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{item.equipment_name}</td>
                                        <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{item.equipment_type}</td>
                                        <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{item.quantity}</td>
                                        <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{formatDate(item.purchase_date || item.transfer_date)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
