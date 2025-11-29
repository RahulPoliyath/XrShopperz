import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Show splash for 2.5 seconds, then trigger fade out
    const timer = setTimeout(() => {
      setFadeOut(true);
      // Wait for the CSS transition (700ms) to finish before unmounting
      setTimeout(() => {
        onComplete();
      }, 700); 
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-900 transition-opacity duration-700 ease-in-out ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center">
        {/* Logo Container with Glow Effect */}
        <div className="mb-8 relative group">
          <div className="absolute inset-0 bg-indigo-600 blur-2xl opacity-20 rounded-full group-hover:opacity-30 transition-opacity duration-500"></div>
          <div className="relative bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-2xl transform transition-transform duration-700 hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        {/* Brand Text */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          Shopperz <span className="text-indigo-500">Stop</span>
        </h1>
        <p className="text-gray-400 text-lg mb-12 font-light tracking-wide">
          The Future of AI Shopping
        </p>

        {/* Custom Loading Indicators */}
        <div className="flex space-x-3">
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
          <div className="w-3 h-3 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
        </div>
      </div>
    </div>
  );
};