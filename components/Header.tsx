
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-purple-600 to-blue-500 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <p className="font-bold">This is a sample BAOAI shop account, create a free account to explore your own data</p>
          <p className="text-sm opacity-80">You are currently in the BAOAI Insight demo</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors">
            Schedule a discovery call
          </button>
          <button className="bg-white text-brand-purple hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg text-sm transition-colors">
            Create my account
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;