
import React from 'react';
import { ViewMode } from '../types';

interface NavbarProps {
  currentView: ViewMode;
  setView: (view: ViewMode) => void;
  cartCount: number;
  isDark: boolean;
  toggleTheme: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentView, 
  setView, 
  cartCount, 
  isDark, 
  toggleTheme,
  searchTerm,
  onSearchChange
}) => {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => setView('shop')}>
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            </div>
            <span className="hidden md:block text-xl font-bold text-gray-900 dark:text-white tracking-tight">Shopperz<span className="text-indigo-600 dark:text-indigo-400">Stop</span></span>
          </div>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-lg px-4 lg:px-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-full leading-5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
                placeholder="Search products..."
              />
            </div>
          </div>
          
          {/* Actions Section */}
          <div className="flex items-center space-x-1 sm:space-x-4 flex-shrink-0">
            <button
              onClick={() => setView('shop')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentView === 'shop' 
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Shop
            </button>
            
            <button
              onClick={() => setView('orders')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hidden sm:block ${
                currentView === 'orders' 
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              My Orders
            </button>

            <button
              onClick={() => setView('admin')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentView === 'admin' 
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Admin
            </button>
            
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1 sm:mx-2"></div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            {/* Wishlist Button */}
            <button
              onClick={() => setView('wishlist')}
              className={`p-2 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ${
                currentView === 'wishlist'
                  ? 'text-pink-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400'
              }`}
              aria-label="Wishlist"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={currentView === 'wishlist' ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
               </svg>
            </button>

            <button
              onClick={() => setView('cart')}
              className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 group"
              aria-label="Cart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white transform bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900 animate-pulse-short">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
