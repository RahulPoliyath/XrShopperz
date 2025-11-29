
import React, { useState } from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart, 
  onQuickView, 
  isWishlisted, 
  onToggleWishlist 
}) => {
  const [showCopied, setShowCopied] = useState(false);

  // Simple logic to show a badge for high rated items
  const isPopular = product.rating >= 4.8;
  const isNew = product.reviews < 50;
  const isSale = product.isOnSale && product.salePrice;

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} on ShopperzStop!`,
      url: window.location.href, // In a real app, this would be a specific product URL
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      try {
        const textArea = document.createElement("textarea");
        textArea.value = `${shareData.text} ${shareData.url}`;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          setShowCopied(true);
          setTimeout(() => setShowCopied(false), 2000);
        } catch (err) {
          console.error('Fallback: Oops, unable to copy', err);
        }
        document.body.removeChild(textArea);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
      <div className="relative pt-[100%] bg-gray-100 dark:bg-gray-700 overflow-hidden cursor-pointer" onClick={() => onQuickView(product)}>
        <img 
          src={product.image} 
          alt={product.name} 
          className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
        />
        
        {/* Quick View Overlay Button */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white px-4 py-2 rounded-full font-medium text-sm transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Quick View
          </button>
        </div>
        
        {/* Action Buttons (Top Right) */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
          {/* Wishlist Button */}
          <button
             onClick={(e) => {
               e.stopPropagation();
               onToggleWishlist(product);
             }}
             className={`p-2 bg-white/90 dark:bg-gray-900/90 rounded-full shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 ${
               isWishlisted ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500 dark:text-gray-500'
             }`}
             title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isWishlisted ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
             </svg>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="p-2 bg-white/90 dark:bg-gray-900/90 rounded-full text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
            title="Share Product"
          >
            {showCopied ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            )}
          </button>
          {showCopied && (
            <div className="absolute top-full right-0 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap animate-fade-in z-30">
              Link Copied!
            </div>
          )}
        </div>

        {/* Badges (Left) */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none">
          {isSale && (
            <span className="bg-red-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm animate-pulse-slow">
              Sale
            </span>
          )}
          {isPopular && !isSale && (
            <span className="bg-amber-400/90 backdrop-blur-sm text-amber-900 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Best Seller
            </span>
          )}
          {isNew && !isSale && (
            <span className="bg-indigo-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
              New Arrival
            </span>
          )}
        </div>
        
        {/* Category Tag (Bottom Right) */}
        <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-700 pointer-events-none">
          {product.category}
        </div>
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <div className="mb-2">
          <h3 
            className="text-lg font-bold text-gray-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer"
            onClick={() => onQuickView(product)}
          >
            {product.name}
          </h3>
        </div>

        <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg 
                  key={i} 
                  className={`w-3.5 h-3.5 ${i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 border-l border-gray-300 dark:border-gray-600 pl-2">
              {product.reviews} reviews
            </span>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 flex-grow">
          {product.description}
        </p>
        
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex flex-col">
            {isSale ? (
              <>
                 <span className="text-xs text-gray-400 line-through decoration-red-400/50">
                    ${product.price.toFixed(2)}
                 </span>
                 <span className="text-xl font-bold text-red-600 dark:text-red-400">
                    ${product.salePrice?.toFixed(2)}
                 </span>
              </>
            ) : (
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
          
          <button 
            onClick={() => onAddToCart(product)}
            className="group/btn relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition-all duration-200 bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:bg-indigo-600 dark:hover:bg-indigo-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 overflow-hidden"
          >
            <span className="relative z-10 flex items-center">
              Add to Cart
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5 transition-transform group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
