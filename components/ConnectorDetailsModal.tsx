
import React from 'react';
import type { ConnectorConnection } from '../types';

interface ConnectorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectorName: string;
  connections: ConnectorConnection[];
  onAddNew: () => void;
}

const ConnectorDetailsModal: React.FC<ConnectorDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  connectorName, 
  connections,
  onAddNew
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center transition-opacity duration-300" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl m-4 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800">{connectorName} Connections</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto mb-6 flex-grow pr-2">
          {connections.length > 0 ? (
            connections.map((conn) => (
              <div key={conn.id} className="border border-brand-gray-200 rounded-lg p-4 flex justify-between items-center bg-white hover:bg-brand-gray-100 transition-colors">
                <div>
                  <p className="font-semibold text-gray-800">{conn.name}</p>
                  <p className="text-xs text-brand-gray-500 font-mono mt-1">ID: {conn.id}</p>
                </div>
                <div className="flex items-center space-x-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${conn.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {conn.status}
                    </span>
                    <button className="text-brand-purple text-sm font-medium hover:underline">
                        View Jobs
                    </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-brand-gray-500 text-center">No active connections found.</p>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-brand-gray-200 flex-shrink-0">
          <button 
            onClick={onAddNew}
            className="px-4 py-2 bg-brand-purple hover:bg-purple-700 text-white font-semibold rounded-lg text-sm transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Connect another
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectorDetailsModal;
