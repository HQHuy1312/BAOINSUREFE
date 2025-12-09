import React from 'react';
import { NAV_ITEMS } from '../constants';
import type { NavItemType } from '../types';
import { AskBAOAIicon } from './icons';
import { useAuth } from '../context/AuthContext';

const NavItem: React.FC<{ item: NavItemType }> = ({ item }) => {
  if (item.isHeader) {
    return (
      <div className="px-4 pt-6 pb-2 flex justify-between items-center">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{item.label}</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <a
      href="#"
      className={`flex items-center space-x-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
        item.active
          ? 'bg-brand-purple-light text-brand-purple'
          : 'text-brand-gray-600 hover:bg-brand-gray-200'
      }`}
    >
      <span className={item.active ? 'text-brand-purple' : 'text-brand-gray-500'}>{item.icon}</span>
      <span>{item.label}</span>
      {item.badge && (
        <span className="ml-auto text-xs font-semibold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
          {item.badge}
        </span>
      )}
       {item.active && (
        <span className="ml-auto w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
      )}
    </a>
  );
};


const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  return (
    <aside className="w-64 bg-white border-r border-brand-gray-200 p-4 flex flex-col h-[calc(100vh-68px)] sticky top-0">
      <div className="flex items-center space-x-3 p-2 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
          B
        </div>
        <div>
          <h2 className="font-bold text-gray-800">BAOAI shop</h2>
          <a href="#" className="text-xs text-brand-gray-500 hover:text-brand-purple flex items-center">
            Complete your profile
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1 overflow-y-auto pr-2">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.id} item={item} />
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-brand-gray-200 space-y-2">
        <a
          href="#"
          className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors text-brand-gray-600 hover:bg-brand-gray-200"
        >
          <AskBAOAIicon className="w-5 h-5 text-brand-purple" />
          <span>Ask BAOAI</span>
        </a>
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors text-brand-gray-600 hover:bg-brand-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;