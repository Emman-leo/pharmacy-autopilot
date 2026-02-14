// Point of Sale Component
import React from 'react';

const PointOfSale = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Point of Sale</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Section */}
        <div className="lg:col-span-2 card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Shopping Cart</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v5m0 0v5" />
            </svg>
            <p className="mt-2 text-gray-500">Scan items or search to add to cart</p>
          </div>
        </div>
        
        {/* Payment Section */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment</h3>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Subtotal</p>
              <p className="text-2xl font-bold">$0.00</p>
            </div>
            <button className="w-full btn btn-primary py-3">
              Process Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointOfSale;