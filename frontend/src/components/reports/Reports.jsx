// Reports Component
import React from 'react';

const Reports = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Sales</span>
              <span className="font-semibold">$0.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Sale</span>
              <span className="font-semibold">$0.00</span>
            </div>
            <button className="w-full mt-4 btn btn-secondary">
              View Details
            </button>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Selling Drugs</h3>
          <div className="text-center py-8">
            <p className="text-gray-500">No sales data available</p>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Expiry Alerts</h3>
          <div className="text-center py-8">
            <p className="text-gray-500">No expiry alerts</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;