
import React, { useEffect, useState } from 'react';
import { Order } from '../types';

interface TrackingModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TrackingModal: React.FC<TrackingModalProps> = ({ order, isOpen, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

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

  if (!order && !isVisible) return null;
  
  // Safe access for animation
  const displayOrder = order || { id: '', date: new Date().toISOString(), status: 'Processing', items: [], total: 0 } as any as Order;

  // Generate timeline based on statusHistory or fallback to mock if legacy data
  const getTimeline = () => {
    // Special handling for cancelled orders
    if (displayOrder.status === 'Cancelled') {
        const history = displayOrder.statusHistory || [];
        const cancelledEvent = history.slice().reverse().find(h => h.status === 'Cancelled');
        return [{
            status: 'Cancelled',
            date: cancelledEvent ? new Date(cancelledEvent.date).toLocaleString() : new Date().toLocaleString(),
            description: cancelledEvent?.note || 'Order has been cancelled.',
            completed: true
        }];
    }

    if (displayOrder.statusHistory && displayOrder.statusHistory.length > 0) {
      // Use real history
      const history = displayOrder.statusHistory;
      
      const findEvent = (status: string) => history.slice().reverse().find(h => h.status === status);
      
      const placedEvent = findEvent('Placed');
      const processingEvent = findEvent('Processing');
      const shippedEvent = findEvent('Shipped');
      const outForDeliveryEvent = findEvent('Out for Delivery');
      const deliveredEvent = findEvent('Delivered');
      
      const timelineEvents = [];

      // 1. Placed
      timelineEvents.push({
        status: 'Order Placed',
        date: placedEvent ? new Date(placedEvent.date).toLocaleString() : new Date(displayOrder.date).toLocaleString(),
        description: placedEvent?.note || 'Order placed successfully.',
        completed: true
      });

      // 2. Processing
      timelineEvents.unshift({
        status: 'Processing',
        date: processingEvent ? new Date(processingEvent.date).toLocaleString() : (placedEvent ? 'Pending' : '--'),
        description: processingEvent?.note || 'Seller is preparing your order.',
        completed: !!processingEvent
      });

      // 3. Shipped
      timelineEvents.unshift({
        status: 'Shipped',
        date: shippedEvent ? new Date(shippedEvent.date).toLocaleString() : 'Pending',
        description: shippedEvent?.note || 'Package has left the facility.',
        completed: !!shippedEvent
      });

      // 4. Out for Delivery
      timelineEvents.unshift({
        status: 'Out for Delivery',
        date: outForDeliveryEvent ? new Date(outForDeliveryEvent.date).toLocaleString() : 'Pending',
        description: outForDeliveryEvent?.note || 'Courier is out for delivery.',
        completed: !!outForDeliveryEvent
      });

      // 5. Delivered
      timelineEvents.unshift({
        status: 'Delivered',
        date: deliveredEvent ? new Date(deliveredEvent.date).toLocaleString() : 'Pending',
        description: deliveredEvent?.note || 'Package delivered to your doorstep.',
        completed: !!deliveredEvent
      });

      return timelineEvents;

    } else {
      // Legacy / Mock Fallback
      const events = [];
      const date = new Date(displayOrder.date);
      
      // Base event: Order Placed
      events.push({
        status: 'Order Placed',
        date: date.toLocaleString(),
        description: 'Your order has been placed successfully.',
        completed: true
      });

      // Processing Event
      const isProcessing = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'].includes(displayOrder.status);
      events.unshift({
        status: 'Processing',
        date: isProcessing ? new Date(date.getTime() + 3600000).toLocaleString() : 'Pending', // +1 hour
        description: 'Seller is preparing your order.',
        completed: isProcessing
      });

      // Shipped Event
      const isShipped = ['Shipped', 'Out for Delivery', 'Delivered'].includes(displayOrder.status);
      events.unshift({
        status: 'Shipped',
        date: isShipped ? new Date(date.getTime() + 86400000).toLocaleString() : 'Pending', // +1 day
        description: 'Package has left the facility.',
        completed: isShipped
      });

      // Out for Delivery Event
      const isOutForDelivery = ['Out for Delivery', 'Delivered'].includes(displayOrder.status);
      events.unshift({
        status: 'Out for Delivery',
        date: isOutForDelivery ? new Date(date.getTime() + 172800000).toLocaleString() : 'Pending', // +2 days
        description: 'Courier is out for delivery.',
        completed: isOutForDelivery
      });

      // Delivered Event
      const isDelivered = displayOrder.status === 'Delivered';
      events.unshift({
        status: 'Delivered',
        date: isDelivered ? new Date(date.getTime() + 259200000).toLocaleString() : 'Pending', // +3 days
        description: 'Package delivered to your doorstep.',
        completed: isDelivered
      });

      return events;
    }
  };

  const timeline = getTimeline();

  return (
    <div className={`fixed inset-0 z-[70] flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
       {/* Backdrop */}
       <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

       <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] relative transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
            <div>
               <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tracking Details</h3>
               <p className="text-sm text-gray-500 dark:text-gray-400">Order #{displayOrder.id}</p>
            </div>
            <button onClick={onClose} className="p-2 bg-gray-200 dark:bg-gray-600 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Tracking Info Bar */}
          <div className="px-6 py-4 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-800/50 flex flex-wrap gap-4 justify-between items-center">
             <div>
               <p className="text-xs text-indigo-500 dark:text-indigo-300 uppercase font-bold tracking-wider">Tracking Number</p>
               <p className="text-lg font-mono font-bold text-indigo-700 dark:text-indigo-200">
                 {displayOrder.trackingId || <span className="text-sm font-normal italic opacity-70">Not available yet</span>}
               </p>
             </div>
             <div className="text-right">
               <p className="text-xs text-indigo-500 dark:text-indigo-300 uppercase font-bold tracking-wider">Status</p>
               <p className={`text-sm font-semibold ${displayOrder.status === 'Cancelled' ? 'text-red-600 dark:text-red-400' : 'text-indigo-700 dark:text-indigo-200'}`}>
                 {displayOrder.status}
               </p>
             </div>
          </div>

          {/* Timeline Body */}
          <div className="p-6 overflow-y-auto custom-scrollbar">
             <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-8 pb-2">
                {timeline.map((event, index) => (
                  <div key={index} className={`relative pl-8 ${!event.completed ? 'opacity-50 grayscale' : ''}`}>
                     {/* Dot */}
                     <span className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white dark:border-gray-800 transition-colors duration-500 ${
                       event.completed 
                        ? (event.status === 'Delivered' ? 'bg-green-500 ring-4 ring-green-100 dark:ring-green-900/50' : 
                           event.status === 'Cancelled' ? 'bg-red-500 ring-4 ring-red-100 dark:ring-red-900/50' :
                           'bg-indigo-600 ring-4 ring-indigo-100 dark:ring-indigo-900/50') 
                        : 'bg-gray-300 dark:bg-gray-600'
                     }`}></span>
                     
                     <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                        <div>
                           <h4 className={`text-sm font-bold ${
                             event.completed 
                              ? (event.status === 'Delivered' ? 'text-green-600 dark:text-green-400' : 
                                 event.status === 'Cancelled' ? 'text-red-600 dark:text-red-400' :
                                 'text-indigo-600 dark:text-indigo-400') 
                              : 'text-gray-500 dark:text-gray-400'
                           }`}>
                             {event.status}
                           </h4>
                           <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{event.description}</p>
                        </div>
                        <span className="text-xs text-gray-400 font-mono mt-1 sm:mt-0 whitespace-nowrap">
                          {event.completed ? event.date : '--'}
                        </span>
                     </div>
                  </div>
                ))}
             </div>
          </div>
          
          {/* Footer */}
          {displayOrder.trackingId && displayOrder.status !== 'Cancelled' && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
               <a 
                 href={displayOrder.trackingUrl || '#'} 
                 target="_blank"
                 rel="noopener noreferrer"
                 className={`block w-full text-center py-2 px-4 border rounded-lg transition-colors text-sm font-medium ${
                    displayOrder.trackingUrl 
                      ? "border-indigo-600 text-indigo-600 dark:text-indigo-300 dark:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                      : "border-gray-300 text-gray-400 cursor-not-allowed bg-gray-100 dark:bg-gray-800 dark:border-gray-600"
                 }`}
                 onClick={(e) => !displayOrder.trackingUrl && e.preventDefault()}
               >
                 View on Carrier Website
               </a>
            </div>
          )}
       </div>
    </div>
  );
};