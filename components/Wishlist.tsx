
import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface WishlistProps {
  products: Product[];
  wishlistIds: string[];
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  onStartShopping: () => void;
}

export const Wishlist: React.FC<WishlistProps> = ({ 
  products, 
  wishlistIds, 
  onAddToCart, 
  onQuickView, 
  onToggleWishlist,
  onStartShopping 
}) => {
  const wishlistedProducts = products.filter(p => wishlistIds.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
           <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Your Wishlist</h2>
           <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Items you've saved for later.</p>
        </div>
        <div className="mt-4 md:mt-0 text-sm text-gray-500 dark:text-gray-400">
           {wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'item' : 'items'}
        </div>
      </div>
      
      {wishlistedProducts.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-pink-50 dark:bg-pink-900/30 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-pink-500 dark:text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Your wishlist is empty</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">Heart items to save them here for later!</p>
          <button
            onClick={onStartShopping}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {wishlistedProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={onAddToCart} 
              onQuickView={onQuickView}
              isWishlisted={true}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
};
