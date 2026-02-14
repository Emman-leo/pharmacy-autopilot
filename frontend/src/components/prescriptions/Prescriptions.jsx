// Prescriptions Component
import React from 'react';

const Prescriptions = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Prescription Management</h2>
        <button className="btn btn-primary">
          New Prescription
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Pending Approvals</h3>
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2 text-gray-500">No pending prescriptions</p>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Prescriptions</h3>
          <div className="text-center py-8">
            <p className="text-gray-500">No recent prescriptions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prescriptions;