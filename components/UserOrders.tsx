
import React, { useState } from 'react';
import { Order } from '../types';
import { TrackingModal } from './TrackingModal';
import { storeService } from '../services/storeService';

interface UserOrdersProps {
  orders: Order[];
  onStartShopping: () => void;
}

export const UserOrders: React.FC<UserOrdersProps> = ({ orders, onStartShopping }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);

  const handleDownloadInvoice = (order: Order) => {
    // Re-calculate breakdown (matching Cart logic)
    const subtotal = order.items.reduce((sum, item) => {
      const price = item.isOnSale && item.salePrice ? item.salePrice : item.price;
      return sum + (price * item.quantity);
    }, 0);
    
    // Logic: Shipping is $15 if subtotal < 100, else 0. Tax is 8%.
    const shipping = subtotal > 100 ? 0 : 15;
    const taxRate = 0.08;
    const tax = subtotal * taxRate;
    const invoiceDate = new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    const invoiceHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Invoice #${order.id}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { margin: 0; }
          @media print {
            body { background-color: white; }
            .print-container { box-shadow: none; border: none; padding: 2rem; margin: 0; width: 100%; max-width: 100%; }
          }
        </style>
      </head>
      <body class="bg-gray-100 min-h-screen py-10 flex justify-center">
        
        <div class="print-container bg-white w-full max-w-4xl p-12 shadow-xl rounded-lg mx-4 relative overflow-hidden">
          
          <!-- Watermark -->
          <div class="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
             <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 24 24" fill="currentColor" class="text-indigo-600 transform rotate-12">
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
             </svg>
          </div>

          <!-- Header -->
          <div class="flex justify-between items-start mb-12 relative z-10">
            <div class="flex flex-col">
               <div class="flex items-center gap-2 mb-2">
                  <div class="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                     </svg>
                  </div>
                  <span class="text-3xl font-extrabold tracking-tight text-gray-900">Shopperz<span class="text-indigo-600">Stop</span></span>
               </div>
               <div class="text-gray-500 text-sm mt-2 leading-relaxed">
                 <strong>ShopperzStop Inc.</strong><br>
                 123 Commerce Blvd, Tech Park<br>
                 San Francisco, CA 94105<br>
                 Tax ID: US-883920-X
               </div>
            </div>
            
            <div class="text-right">
              <h1 class="text-5xl font-extrabold text-gray-100 uppercase tracking-widest mb-2">Invoice</h1>
              <table class="text-right float-right text-sm mt-4">
                 <tr>
                   <td class="text-gray-500 pr-4 py-1">Invoice Number:</td>
                   <td class="font-bold text-gray-900">INV-${order.id}</td>
                 </tr>
                 <tr>
                   <td class="text-gray-500 pr-4 py-1">Invoice Date:</td>
                   <td class="font-bold text-gray-900">${invoiceDate}</td>
                 </tr>
                 <tr>
                   <td class="text-gray-500 pr-4 py-1">Order Ref:</td>
                   <td class="font-bold text-gray-900">#${order.id}</td>
                 </tr>
              </table>
            </div>
          </div>

          <!-- Addresses -->
          <div class="flex flex-col md:flex-row justify-between mb-12 border-t border-b border-gray-100 py-8">
            <div class="w-full md:w-1/2 pr-8 mb-6 md:mb-0">
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Bill To</h3>
              <p class="font-bold text-gray-900 text-lg">${order.customerName}</p>
              <p class="text-gray-600 text-sm leading-relaxed mt-1">
                ${order.address}<br>
                ${order.city}<br>
                ${order.email}
              </p>
            </div>
            <div class="w-full md:w-1/2 md:pl-8 md:border-l border-gray-100">
               <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ship To</h3>
               <p class="font-bold text-gray-900 text-lg">${order.customerName}</p>
               <p class="text-gray-600 text-sm leading-relaxed mt-1">
                 ${order.address}<br>
                 ${order.city}
               </p>
               <div class="mt-4">
                 <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Method</h3>
                 <div class="flex items-center gap-2 text-sm text-gray-700">
                   <svg class="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd" /></svg>
                   Credit Card ending in **** 4242
                 </div>
               </div>
            </div>
          </div>

          <!-- Line Items -->
          <div class="mb-8">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b-2 border-gray-900">
                  <th class="py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/2">Item Description</th>
                  <th class="py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Qty</th>
                  <th class="py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Unit Price</th>
                  <th class="py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Total</th>
                </tr>
              </thead>
              <tbody class="text-sm">
                ${order.items.map((item, index) => {
                  const price = item.isOnSale && item.salePrice ? item.salePrice : item.price;
                  const itemTotal = price * item.quantity;
                  return `
                    <tr class="border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50/50' : ''}">
                      <td class="py-4 pl-2">
                        <p class="font-bold text-gray-900">${item.name}</p>
                        <p class="text-xs text-gray-500 mt-0.5">Category: ${item.category}</p>
                      </td>
                      <td class="py-4 text-center text-gray-600 font-medium">${item.quantity}</td>
                      <td class="py-4 text-right text-gray-600">$${price.toFixed(2)}</td>
                      <td class="py-4 text-right font-bold text-gray-900">$${itemTotal.toFixed(2)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Summary -->
          <div class="flex flex-col items-end mb-12">
            <div class="w-full sm:w-1/2 lg:w-1/3 space-y-3">
              <div class="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span class="font-medium">$${subtotal.toFixed(2)}</span>
              </div>
              <div class="flex justify-between text-sm text-gray-600">
                <span>Shipping & Handling</span>
                <span class="font-medium">${shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div class="flex justify-between text-sm text-gray-600">
                <span>Tax (8%)</span>
                <span class="font-medium">$${tax.toFixed(2)}</span>
              </div>
              <div class="h-px bg-gray-200 my-2"></div>
              <div class="flex justify-between text-lg font-bold text-indigo-900 bg-indigo-50 p-2 rounded">
                <span>Total Due</span>
                <span>$${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="border-t-2 border-gray-100 pt-8 mt-auto">
            <div class="flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
              <div class="text-sm text-gray-500">
                <p class="font-bold text-gray-900 mb-1">Thank you for your business!</p>
                <p>Please contact us for any returns or questions.</p>
              </div>
              <div class="text-xs text-gray-400">
                <p>support@shopperzstop.com</p>
                <p>+1 (555) 123-4567</p>
                <p>www.shopperzstop.com</p>
              </div>
            </div>
          </div>

        </div>

        <script>
          setTimeout(() => {
            window.print();
          }, 500);
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '', 'width=1000,height=900');
    if (printWindow) {
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();
    }
  };

  const handleCancelOrder = () => {
    if (orderToCancel) {
      storeService.updateOrderStatus(orderToCancel, 'Cancelled');
      setOrderToCancel(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
           <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Order History</h2>
           <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Track and view your past purchases.</p>
        </div>
      </div>
      
      {/* Tracking Modal */}
      <TrackingModal 
        order={selectedOrder} 
        isOpen={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
      />

      {/* Cancellation Confirmation Modal */}
      {orderToCancel && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                 <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                    <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                 </div>
                 <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Cancel Order?</h3>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Are you sure you want to cancel order #{orderToCancel}? This action cannot be undone.
                 </p>
                 <div className="flex space-x-3">
                    <button 
                       onClick={() => setOrderToCancel(null)}
                       className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                    >
                       No, Keep Order
                    </button>
                    <button 
                       onClick={handleCancelOrder}
                       className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                       Yes, Cancel
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
      
      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-900/30 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No orders yet</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">You haven't placed any orders yet. Start shopping to fill this page!</p>
          <button
            onClick={onStartShopping}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md">
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-700 sm:flex sm:items-center sm:justify-between">
                <div className="flex flex-col sm:flex-row sm:space-x-8">
                  <div className="mb-2 sm:mb-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order Placed</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{new Date(order.date).toLocaleDateString()}</p>
                  </div>
                  <div className="mb-2 sm:mb-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">${order.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ship To</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{order.customerName}</p>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 flex flex-col sm:items-end">
                   <div className="flex flex-col items-end gap-1">
                     <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Order #{order.id}</p>
                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        order.status === 'Out for Delivery' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                     }`}>
                       {order.status}
                     </span>
                     
                     <div className="flex flex-wrap justify-end gap-2 mt-2">
                        {/* Download Invoice Button */}
                        <button
                          onClick={() => handleDownloadInvoice(order)}
                          className="text-xs flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                          title="Download Invoice"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Invoice
                        </button>

                        {/* Track Button */}
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="text-xs flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors border border-indigo-200 dark:border-indigo-800 rounded-md px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Track Package
                        </button>
                        
                        {/* Cancel Button - Only for Processing orders */}
                        {order.status === 'Processing' && (
                           <button
                              onClick={() => setOrderToCancel(order.id)}
                              className="text-xs flex items-center text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium transition-colors border border-red-200 dark:border-red-800 rounded-md px-2 py-1 bg-red-50 dark:bg-red-900/20"
                              title="Cancel Order"
                           >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Cancel
                           </button>
                        )}
                     </div>
                   </div>
                </div>
              </div>
              
              <div className="px-6 py-6">
                <ul className="space-y-4">
                  {order.items.map((item, idx) => {
                     const effectivePrice = item.isOnSale && item.salePrice ? item.salePrice : item.price;
                     return (
                        <li key={idx} className="flex items-start">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="h-16 w-16 rounded-lg object-cover bg-gray-100 dark:bg-gray-600 border border-gray-200 dark:border-gray-600 flex-shrink-0" 
                          />
                          <div className="ml-4 flex-1">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">{item.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{item.description}</p>
                            <div className="mt-1 flex items-center text-sm">
                              <span className="font-medium text-gray-900 dark:text-white">Qty: {item.quantity}</span>
                              <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
                              <span className="font-medium text-indigo-600 dark:text-indigo-400">${effectivePrice.toFixed(2)}</span>
                            </div>
                          </div>
                        </li>
                     );
                  })}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};