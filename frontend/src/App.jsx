// Main App component with routing
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './components/auth/Login';
import Dashboard from './components/layout/Dashboard';
import Inventory from './components/inventory/Inventory';
import PointOfSale from './components/sales/PointOfSale';
import Prescriptions from './components/prescriptions/Prescriptions';
import Reports from './components/reports/Reports';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }>
              <Route index element={<div className="p-6">Welcome to Pharmacy Management System</div>} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="pos" element={<PointOfSale />} />
              <Route path="prescriptions" element={<Prescriptions />} />
              <Route path="reports" element={<Reports />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;