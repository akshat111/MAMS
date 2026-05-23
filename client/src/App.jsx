import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import EquipmentPage from './pages/EquipmentPage';
import PurchasesPage from './pages/PurchasesPage';
import TransfersPage from './pages/TransfersPage';
import AssignmentsPage from './pages/AssignmentsPage';
import ExpendituresPage from './pages/ExpendituresPage';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import './App.css';

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-content">
        <Navbar />
        <div className="app-main">
          {children}
        </div>
      </div>
    </div>
  );
}


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout><Dashboard /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/equipment" element={
            <ProtectedRoute allowedRoles={['Admin', 'LogisticsOfficer', 'BaseCommander']}>
              <AppLayout><EquipmentPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/purchases" element={
            <ProtectedRoute allowedRoles={['Admin', 'LogisticsOfficer']}>
              <AppLayout><PurchasesPage /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/transfers" element={
            <ProtectedRoute allowedRoles={['Admin', 'LogisticsOfficer', 'BaseCommander']}>
              <AppLayout><TransfersPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/assignments" element={
            <ProtectedRoute allowedRoles={['Admin', 'LogisticsOfficer', 'BaseCommander']}>
              <AppLayout><AssignmentsPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/expenditures" element={
            <ProtectedRoute allowedRoles={['Admin', 'LogisticsOfficer', 'BaseCommander']}>
              <AppLayout><ExpendituresPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
export default App;