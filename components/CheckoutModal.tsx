
import React, { useState } from 'react';
import { CartItem, Order } from '../types';
import { storeService } from '../services/storeService';

interface CheckoutModalProps {
  items: CartItem[];
  total: number;
  onClose: () => void;
  onComplete: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ items, total, onClose, onComplete }) => {
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    cardName: '',
    cardNumber: '',
    expDate: '',
    cvv: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');

    // Simulate API processing delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    const now = new Date().toISOString();

    // Create and save the order with initial history
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      customerName: formData.name,
      email: formData.email,
      address: formData.address,
      city: formData.city,
      items: [...items], // Create a copy of the items
      total: total,
      date: now,
      status: 'Processing',
      statusHistory: [
        { 
          status: 'Placed', 
          date: now, 
          note: 'Order placed successfully.' 
        },
        { 
          status: 'Processing', 
          date: now, 
          note: 'Payment confirmed. We are preparing your order.' 
        }
      ]
    };

    storeService.addOrder(newOrder);

    setStep('success');
  };

  const handleFinalize = () => {
    onComplete();
  };

  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm animate-fade-in">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-gray-200 dark:border-gray-700 transform transition-all scale-100 relative overflow-hidden">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Order Placed!</h2>
          
          {/* Order Details Receipt */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6 text-left text-sm border border-gray-100 dark:border-gray-600">
            <div className="border-b border-gray-200 dark:border-gray-600 pb-3 mb-3">
              <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-1">Customer</p>
              <p className="font-semibold text-gray-900 dark:text-white">{formData.name}</p>
              <p className="text-gray-500 dark:text-gray-400">{formData.email}</p>
            </div>
            
            <div className="border-b border-gray-200 dark:border-gray-600 pb-3 mb-3">
              <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-2">Order Summary</p>
              <ul className="space-y-1 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item, idx) => (
                  <li key={idx} className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span className="truncate pr-2">{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                    <span className="font-medium">${(item.isOnSale && item.salePrice ? item.salePrice * item.quantity : item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-between items-center pt-1">
              <p className="font-bold text-gray-900 dark:text-white">Total Amount</p>
              <p className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">${total.toFixed(2)}</p>
            </div>
          </div>

          <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
            Thank you for your purchase, {formData.name.split(' ')[0]}! Your order has been confirmed and will be shipped to <strong>{formData.city}</strong> soon.
          </p>
          
          <button
            onClick={handleFinalize}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors focus:ring-4 focus:ring-indigo-500/50"
          >
            Return to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl my-8 border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 rounded-t-xl sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure Checkout
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Shipping Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Shipping Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors" placeholder="John Doe" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors" placeholder="john@example.com" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                  <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors" placeholder="123 Main St" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                  <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors" placeholder="New York" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zip Code</label>
                  <input required type="text" name="zip" value={formData.zip} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors" placeholder="10001" />
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="space-y-4 pt-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Payment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name on Card</label>
                  <input required type="text" name="cardName" value={formData.cardName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors" placeholder="John Doe" />
                </div>
                <div className="md:col-span-2 relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Card Number</label>
                  <input required type="text" name="cardNumber" value={formData.cardNumber} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors pl-10" placeholder="0000 0000 0000 0000" />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiration</label>
                  <input required type="text" name="expDate" value={formData.expDate} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors" placeholder="MM/YY" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CVV</label>
                  <input required type="text" name="cvv" value={formData.cvv} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors" placeholder="123" />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl sticky bottom-0 z-10">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">${total.toFixed(2)}</span>
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={step === 'processing'}
              className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="checkout-form"
              disabled={step === 'processing'}
              className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {step === 'processing' ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                `Pay $${total.toFixed(2)}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
