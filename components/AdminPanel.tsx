
import React, { useState, useEffect } from 'react';
import { Product, Category, Order } from '../types';
import { generateProductDescription } from '../services/geminiService';
import { storeService } from '../services/storeService';

interface AdminPanelProps {
  products: Product[];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ products }) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');
  const [categories, setCategories] = useState<string[]>(storeService.getCategories());
  const [orders, setOrders] = useState<Order[]>(storeService.getOrders());
  const [orderFilter, setOrderFilter] = useState<'All' | Order['status']>('All');
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: categories[0] || Category.ELECTRONICS,
    image: 'https://picsum.photos/400/400?random=' + Math.floor(Math.random() * 100),
    description: '',
    features: '', // For AI generation
    isOnSale: false,
    salePrice: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // State for new category input
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // State for editing tracking ID
  const [editingTrackingOrder, setEditingTrackingOrder] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [trackingUrlInput, setTrackingUrlInput] = useState('');

  // Subscribe to store updates to keep categories and orders in sync
  useEffect(() => {
    const updateState = () => {
      setCategories(storeService.getCategories());
      setOrders(storeService.getOrders());
    };
    const unsubscribe = storeService.subscribe(updateState);
    return unsubscribe;
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    const name = target.name;
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.name || !formData.features) {
      alert("Please enter a product name and some key features first.");
      return;
    }
    setIsGenerating(true);
    const desc = await generateProductDescription(formData.name, formData.category, formData.features);
    setFormData(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      storeService.addCategory(newCategoryName.trim());
      setFormData(prev => ({ ...prev, category: newCategoryName.trim() }));
      setNewCategoryName('');
      setShowNewCategoryInput(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      image: product.image,
      description: product.description,
      features: '',
      isOnSale: product.isOnSale || false,
      salePrice: product.salePrice ? product.salePrice.toString() : ''
    });
    setActiveTab('inventory');
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: '',
      price: '',
      category: categories[0] || Category.ELECTRONICS,
      image: 'https://picsum.photos/400/400?random=' + Math.floor(Math.random() * 100),
      description: '',
      features: '',
      isOnSale: false,
      salePrice: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.description) return;

    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      description: formData.description,
      category: formData.category,
      image: formData.image,
      isOnSale: formData.isOnSale,
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined
    };

    if (editingId) {
      // Update existing product
      const originalProduct = products.find(p => p.id === editingId);
      if (originalProduct) {
        storeService.updateProduct({
          ...originalProduct,
          ...productData
        });
      }
      setEditingId(null);
    } else {
      // Create new product
      storeService.addProduct(productData);
    }

    // Reset form
    setFormData({
      name: '',
      price: '',
      category: categories[0] || Category.ELECTRONICS,
      image: 'https://picsum.photos/400/400?random=' + Math.floor(Math.random() * 100),
      description: '',
      features: '',
      isOnSale: false,
      salePrice: ''
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      storeService.deleteProduct(id);
      if (editingId === id) {
        handleCancelEdit();
      }
    }
  };

  const handleUpdateStatus = (orderId: string, newStatus: Order['status']) => {
    storeService.updateOrderStatus(orderId, newStatus);
  };

  const startEditingTracking = (order: Order) => {
    setEditingTrackingOrder(order.id);
    setTrackingInput(order.trackingId || '');
    setTrackingUrlInput(order.trackingUrl || '');
  };

  const saveTracking = (orderId: string) => {
    storeService.updateOrderTracking(orderId, trackingInput, trackingUrlInput);
    setEditingTrackingOrder(null);
  };

  const inputClasses = "mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white";

  const filteredOrders = orders.filter(order => 
    orderFilter === 'All' ? true : order.status === orderFilter
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">Admin Dashboard</h2>
        
        {/* Navigation Tabs */}
        <div className="bg-gray-200 dark:bg-gray-700 p-1 rounded-lg inline-flex">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'inventory' 
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Inventory Management
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'orders' 
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Order History
          </button>
        </div>
      </div>
      
      {activeTab === 'inventory' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add/Edit Product Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 sticky top-24 transition-colors duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingId ? 'Edit Product' : 'Add New Product'}
                </h3>
                {editingId && (
                  <button 
                    onClick={handleCancelEdit}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                )}
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={inputClasses}
                    required
                  />
                </div>

                {/* Image Selection Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Image</label>
                  <div className="space-y-3">
                     {/* URL Input */}
                     <input
                       type="text"
                       name="image"
                       value={formData.image}
                       onChange={handleInputChange}
                       placeholder="Image URL (https://...)"
                       className={inputClasses}
                     />
                     
                     <div className="relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center">
                          <span className="px-2 bg-white dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400">OR UPLOAD</span>
                        </div>
                     </div>
                     
                     {/* File Input */}
                     <input
                       type="file"
                       accept="image/*"
                       onChange={handleImageUpload}
                       className="block w-full text-sm text-gray-500 dark:text-gray-400
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-full file:border-0
                         file:text-xs file:font-semibold
                         file:bg-indigo-50 file:text-indigo-700
                         hover:file:bg-indigo-100
                         dark:file:bg-indigo-900/30 dark:file:text-indigo-300
                         transition-colors cursor-pointer
                       "
                     />
                  </div>
                  {/* Preview */}
                  {formData.image && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Preview:</p>
                      <img src={formData.image} alt="Preview" className="h-24 w-full object-cover rounded-md border border-gray-200 dark:border-gray-600" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price ($)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className={inputClasses}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <div className="flex gap-2">
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {categories.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowNewCategoryInput(!showNewCategoryInput)}
                        className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-300 text-xl font-bold"
                        title="Add New Category"
                      >
                        +
                      </button>
                    </div>
                    
                    {/* New Category Input */}
                    {showNewCategoryInput && (
                      <div className="mt-2 flex gap-2 animate-fade-in">
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="New Category Name"
                          className="flex-1 block rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={handleAddCategory}
                          disabled={!newCategoryName.trim()}
                          className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 text-sm"
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sale Toggle Section */}
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="isOnSale"
                      className="sr-only peer" 
                      checked={formData.isOnSale}
                      onChange={handleInputChange}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Put on Sale</span>
                  </label>

                  {formData.isOnSale && (
                    <div className="mt-3 animate-fade-in">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sale Price ($)</label>
                      <input
                        type="number"
                        name="salePrice"
                        value={formData.salePrice}
                        onChange={handleInputChange}
                        className={inputClasses}
                        required={formData.isOnSale}
                        placeholder="Discounted price"
                      />
                    </div>
                  )}
                </div>

                {/* AI Section */}
                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-md border border-indigo-100 dark:border-indigo-800 transition-colors">
                  <label className="block text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wide mb-1">
                    AI Description Generator
                  </label>
                  <textarea
                    name="features"
                    value={formData.features}
                    onChange={handleInputChange}
                    placeholder="Key features (e.g. waterproof, wireless, organic cotton)..."
                    className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 mb-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={2}
                  />
                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={isGenerating}
                    className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-700 dark:text-indigo-200 bg-indigo-100 dark:bg-indigo-800/50 hover:bg-indigo-200 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                  >
                    {isGenerating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-700 dark:text-indigo-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Generate with Gemini
                      </>
                    )}
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className={inputClasses}
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    {editingId ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Product List */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
              <div className="px-4 py-5 sm:px-6 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Inventory</h3>
              </div>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[800px] overflow-y-auto custom-scrollbar">
                {products.map((product) => (
                  <li key={product.id} className={`p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${editingId === product.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}>
                    <div className="flex items-center space-x-4">
                      <img className="h-12 w-12 rounded object-cover bg-gray-100 dark:bg-gray-600" src={product.image} alt="" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</p>
                          {product.isOnSale && (
                             <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                               SALE
                             </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{product.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                         <span className={`block text-sm font-medium ${product.isOnSale ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                          ${product.isOnSale && product.salePrice ? product.salePrice.toFixed(2) : product.price.toFixed(2)}
                         </span>
                         {product.isOnSale && (
                            <span className="block text-xs text-gray-400 line-through">
                              ${product.price.toFixed(2)}
                            </span>
                         )}
                      </div>
                      <button 
                        onClick={() => handleEdit(product)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
                {products.length === 0 && (
                  <li className="p-8 text-center text-gray-500 dark:text-gray-400">No products found.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* Order History View */
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
               <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Recent Orders</h3>
               <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage and track customer orders.</p>
            </div>
            
            {/* Order Status Filter */}
            <div className="flex items-center space-x-1 sm:space-x-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg overflow-x-auto max-w-full">
               {(['All', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'] as const).map((status) => (
                  <button
                     key={status}
                     onClick={() => setOrderFilter(status)}
                     className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                        orderFilter === status 
                           ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' 
                           : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                     }`}
                  >
                     {status}
                  </button>
               ))}
            </div>
          </div>
          
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
               <svg className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
               </svg>
               <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No orders found</h3>
               <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                 {orders.length === 0 ? "No orders have been placed yet." : `There are no orders with status "${orderFilter}".`}
               </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tracking</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 dark:text-indigo-400">#{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{order.customerName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{order.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(order.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                         {editingTrackingOrder === order.id ? (
                           <div className="flex flex-col space-y-2">
                             <input 
                               type="text" 
                               value={trackingInput}
                               onChange={(e) => setTrackingInput(e.target.value)}
                               className="w-32 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                               placeholder="Tracking ID"
                             />
                             <input 
                               type="text" 
                               value={trackingUrlInput}
                               onChange={(e) => setTrackingUrlInput(e.target.value)}
                               className="w-32 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                               placeholder="Tracking URL"
                             />
                             <div className="flex space-x-2">
                               <button onClick={() => saveTracking(order.id)} className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded hover:bg-green-200 dark:hover:bg-green-900/50">
                                 Save
                               </button>
                               <button onClick={() => setEditingTrackingOrder(null)} className="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-2 py-1 rounded hover:bg-red-200 dark:hover:bg-red-900/50">
                                 Cancel
                               </button>
                             </div>
                           </div>
                         ) : (
                           <div className="flex items-center space-x-2">
                             <div className="flex flex-col">
                               <span className={`text-gray-500 dark:text-gray-400 ${!order.trackingId && 'italic text-xs'}`}>
                                 {order.trackingId || 'None'}
                               </span>
                               {order.trackingUrl && (
                                 <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline">
                                   Link
                                 </a>
                               )}
                             </div>
                             <button 
                               onClick={() => startEditingTracking(order)} 
                               className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                               title="Edit Tracking Info"
                             >
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                               </svg>
                             </button>
                           </div>
                         )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col gap-2">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full w-min whitespace-nowrap
                            ${order.status === 'Delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                              order.status === 'Out for Delivery' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                              order.status === 'Shipped' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                              order.status === 'Cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                            {order.status}
                          </span>
                          <select 
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value as any)}
                            className="text-xs border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 dark:bg-gray-700 dark:text-white"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};