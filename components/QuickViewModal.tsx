
import React, { useEffect, useState } from 'react';
import { Product, Category } from '../types';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart,
  isWishlisted,
  onToggleWishlist
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!product && !isVisible) return null;

  // Render nothing if we are closed and animation finished, but keep it mounted during close animation if needed
  if (!isOpen && !isVisible) return null;
  
  // Safe access in case product is null during exit animation
  const displayProduct = product || { 
    id: 'placeholder',
    name: '', 
    price: 0, 
    image: '', 
    description: '', 
    category: Category.ELECTRONICS, 
    rating: 0, 
    reviews: 0 
  } as Product;

  const handleAddToCart = () => {
    if (product) {
      onAddToCart(product);
      onClose();
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: displayProduct.name,
      text: `Check out ${displayProduct.name} on ShopperzStop!`,
      url: window.location.href, 
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
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

  const isSale = displayProduct.isOnSale && displayProduct.salePrice;

  return (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div 
        className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col md:flex-row transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur-md rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image Section */}
        <div className="w-full md:w-1/2 bg-gray-100 dark:bg-gray-700 relative group overflow-hidden">
          <img 
            src={displayProduct.image} 
            alt={displayProduct.name} 
            className="w-full h-64 md:h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
           {isSale && (
            <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Sale
            </div>
          )}
          
          {/* Wishlist Button Overlay */}
          <div className="absolute top-4 right-14 z-10">
            <button
               onClick={() => onToggleWishlist(displayProduct)}
               className={`p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 ${
                 isWishlisted ? 'text-pink-500' : 'text-gray-500 dark:text-gray-400 hover:text-pink-500'
               }`}
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isWishlisted ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
               </svg>
            </button>
          </div>
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/2 p-6 md:p-8 lg:p-10 flex flex-col">
          <div className="mb-1">
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              {displayProduct.category}
            </span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
            {displayProduct.name}
          </h2>

          <div className="flex items-center mb-4 space-x-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg 
                  key={i} 
                  className={`w-5 h-5 ${i < Math.round(displayProduct.rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {displayProduct.reviews} reviews
            </span>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline space-x-3">
              {isSale ? (
                <>
                  <span className="text-3xl font-bold text-red-600 dark:text-red-400">
                    ${displayProduct.salePrice?.toFixed(2)}
                  </span>
                  <span className="text-xl text-gray-400 line-through decoration-red-400/50">
                    ${displayProduct.price.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${displayProduct.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <div className="prose dark:prose-invert text-gray-600 dark:text-gray-300 mb-8 flex-grow">
            <p>{displayProduct.description}</p>
            <p className="mt-4 text-sm">
              Additional product details like dimensions, materials, and care instructions would typically go here to give the customer a complete picture.
            </p>
          </div>

          <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
             <button
              onClick={handleShare}
              className="relative flex items-center justify-center space-x-2 py-4 px-6 rounded-xl font-bold text-lg border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none"
              title="Share Product"
            >
               {showCopied ? (
                 <span className="text-green-600 dark:text-green-400 text-sm animate-fade-in">Copied!</span>
               ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                 </svg>
               )}
            </button>
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center space-x-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 px-8 rounded-xl font-bold text-lg hover:bg-indigo-600 dark:hover:bg-indigo-400 dark:hover:text-white transition-all transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-indigo-500/30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
