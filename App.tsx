
import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { AdminPanel } from './components/AdminPanel';
import { AdminLogin } from './components/AdminLogin';
import { Cart } from './components/Cart';
import { Assistant } from './components/Assistant';
import { SplashScreen } from './components/SplashScreen';
import { CheckoutModal } from './components/CheckoutModal';
import { QuickViewModal } from './components/QuickViewModal';
import { Hero } from './components/Hero';
import { UserOrders } from './components/UserOrders';
import { Wishlist } from './components/Wishlist';
import { NotificationToast } from './components/NotificationToast';
import { Product, CartItem, ViewMode, Order } from './types';
import { storeService } from './services/storeService';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [view, setView] = useState<ViewMode>('shop');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  
  // Admin Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const productSectionRef = useRef<HTMLDivElement>(null);

  // Theme Effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  // Sync with store
  useEffect(() => {
    const updateState = () => {
      setProducts(storeService.getProducts());
      setCart(storeService.getCart());
      setCategories(storeService.getCategories());
      setOrders(storeService.getOrders());
      setWishlist(storeService.getWishlist());
    };
    
    // Initial fetch
    updateState();
    
    // Subscribe to changes
    const unsubscribe = storeService.subscribe(updateState);
    return unsubscribe;
  }, []);

  const handleAddToCart = (product: Product) => {
    storeService.addToCart(product);
  };

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
  };

  const handleToggleWishlist = (product: Product) => {
    storeService.toggleWishlist(product.id);
  };

  const handleCheckoutClick = () => {
    setIsCheckoutOpen(true);
  };

  const handleOrderComplete = () => {
    storeService.clearCart();
    setIsCheckoutOpen(false);
    setView('shop');
  };

  const handleShopNow = () => {
    if (view !== 'shop') setView('shop');
    // Small timeout to allow view change to render before scrolling
    setTimeout(() => {
      productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Admin Login Logic
  const handleAdminLogin = async (username: string, pass: string): Promise<boolean> => {
    // Normalize inputs to prevent whitespace issues and case sensitivity
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Check credentials against the required values
    if (cleanUser === 'xrrahul' && cleanPass === 'xr123') {
      setIsAdminLoggedIn(true);
      return true;
    }

    return false;
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartTotal = storeService.getTotalPrice();
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200 relative font-sans">
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      
      <NotificationToast />

      {isCheckoutOpen && (
        <CheckoutModal 
          items={cart}
          total={cartTotal} 
          onClose={() => setIsCheckoutOpen(false)} 
          onComplete={handleOrderComplete}
        />
      )}

      <QuickViewModal 
        product={quickViewProduct} 
        isOpen={!!quickViewProduct} 
        onClose={() => setQuickViewProduct(null)} 
        onAddToCart={handleAddToCart}
        isWishlisted={quickViewProduct ? wishlist.includes(quickViewProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
      />
      
      <Navbar 
        currentView={view} 
        setView={setView} 
        cartCount={cartItemCount}
        isDark={isDark}
        toggleTheme={toggleTheme}
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="flex-grow">
        {view === 'shop' && (
          <>
            <Hero onShopNow={handleShopNow} />
            
            <div ref={productSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
                  {searchQuery ? `Search Results for "${searchQuery}"` : 'Latest Collections'}
                </h2>
                
                {/* Scrollable Category Filter */}
                <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 no-scrollbar">
                  {['All', ...categories].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                        selectedCategory === cat
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg transform scale-105'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onAddToCart={handleAddToCart} 
                    onQuickView={handleQuickView}
                    isWishlisted={wishlist.includes(product.id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                  <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No products found matching your criteria.</p>
                  {(searchQuery || selectedCategory !== 'All') && (
                    <button 
                      onClick={() => {
                        setSelectedCategory('All');
                        setSearchQuery('');
                      }}
                      className="mt-4 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-medium"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
              
              {/* Floating Assistant */}
              <Assistant products={products} />
            </div>
          </>
        )}

        {view === 'admin' && (
          <div className="max-w-7xl mx-auto py-8">
            {isAdminLoggedIn ? (
              <AdminPanel products={products} />
            ) : (
              <AdminLogin onLogin={handleAdminLogin} />
            )}
          </div>
        )}

        {view === 'cart' && (
          <Cart items={cart} total={cartTotal} onCheckout={handleCheckoutClick} />
        )}

        {view === 'orders' && (
          <UserOrders orders={orders} onStartShopping={handleShopNow} />
        )}

        {view === 'wishlist' && (
          <Wishlist 
            products={products} 
            wishlistIds={wishlist} 
            onAddToCart={handleAddToCart} 
            onQuickView={handleQuickView}
            onToggleWishlist={handleToggleWishlist}
            onStartShopping={handleShopNow}
          />
        )}
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto transition-colors duration-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
             <div className="mb-4 md:mb-0">
               <span className="text-xl font-bold text-gray-900 dark:text-white">Shopperz<span className="text-indigo-600 dark:text-indigo-400">Stop</span></span>
               <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Premium AI-powered shopping experience.</p>
             </div>
             <div className="flex space-x-6">
               <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">Terms</a>
               <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">Privacy</a>
               <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">Contact</a>
             </div>
          </div>
          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8 text-center">
             <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} ShopperzStop. Built with React, Tailwind & Gemini AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
