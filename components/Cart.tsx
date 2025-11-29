import React from 'react';
import { CartItem } from '../types';
import { storeService } from '../services/storeService';

interface CartProps {
  items: CartItem[];
  total: number;
  onCheckout: () => void;
}

export const Cart: React.FC<CartProps> = ({ items, total, onCheckout }) => {
  const tax = total * 0.08;
  const shipping = total > 100 ? 0 : 15;
  const grandTotal = total + tax + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Shopping Cart</h2>
      
      {items.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 mb-6">
            <svg className="h-10 w-10 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Your cart is empty</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-sm mx-auto">Looks like you haven't added anything to your cart yet. Browse our products to find something you love.</p>
        </div>
      ) : (
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          {/* Cart Items List */}
          <section className="lg:col-span-7">
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors duration-200">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {items.map((item) => {
                   const effectivePrice = item.isOnSale && item.salePrice ? item.salePrice : item.price;
                   return (
                    <li key={item.id} className="p-6 sm:flex sm:items-center bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                      <div className="flex-shrink-0 relative">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="h-24 w-24 rounded-xl object-cover bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                        />
                         {item.isOnSale && (
                          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            SALE
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-4 sm:mt-0 sm:ml-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900 dark:text-white">
                                ${(effectivePrice * item.quantity).toFixed(2)}
                              </p>
                              {item.isOnSale && (
                                <p className="text-xs text-gray-400 line-through">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                            <button 
                              onClick={() => storeService.updateCartQuantity(item.id, -1)}
                              className="px-3 py-1 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            >
                              -
                            </button>
                            <span className="px-3 py-1 text-gray-900 dark:text-white font-medium bg-white dark:bg-gray-800 min-w-[2.5rem] text-center">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => storeService.updateCartQuantity(item.id, 1)}
                              className="px-3 py-1 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            >
                              +
                            </button>
                          </div>
                          
                          <button 
                            onClick={() => storeService.removeFromCart(item.id)}
                            className="text-sm font-medium text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                   );
                })}
              </ul>
            </div>
          </section>

          {/* Order Summary */}
          <section className="mt-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 lg:col-span-5 lg:mt-0 p-8 sticky top-24 transition-colors duration-200">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>

            <dl className="space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-600 dark:text-gray-400">Subtotal</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">${total.toFixed(2)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-600 dark:text-gray-400">Shipping Estimate</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">
                  {shipping === 0 ? <span className="text-green-600 dark:text-green-400">Free</span> : `$${shipping.toFixed(2)}`}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-600 dark:text-gray-400">Tax Estimate (8%)</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">${tax.toFixed(2)}</dd>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex items-center justify-between">
                <dt className="text-base font-bold text-gray-900 dark:text-white">Order Total</dt>
                <dd className="text-base font-bold text-indigo-600 dark:text-indigo-400">${grandTotal.toFixed(2)}</dd>
              </div>
            </dl>

            <div className="mt-8">
              <button
                onClick={onCheckout}
                className="w-full bg-indigo-600 border border-transparent rounded-xl shadow-sm py-4 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:-translate-y-0.5"
              >
                Proceed to Checkout
              </button>
              
              <div className="mt-6 flex justify-center space-x-2 text-gray-400">
                {/* Simple SVG icons for credit cards */}
                <div className="h-6 w-10 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"></div>
                <div className="h-6 w-10 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"></div>
                <div className="h-6 w-10 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"></div>
              </div>
              <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
                Secure checkout powered by Stripe (Mock)
              </p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};