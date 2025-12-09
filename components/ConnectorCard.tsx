
import React from 'react';
import type { ConnectorType } from '../types';

interface ConnectorCardProps {
  connector: ConnectorType;
  onClick: (connectorId: string) => void;
  isLoading: boolean;
  isConnected: boolean;
}

const ConnectorCard: React.FC<ConnectorCardProps> = ({ connector, onClick, isLoading, isConnected }) => {
  // Safety check to prevent crashing if connector data is missing
  if (!connector) {
    return null;
  }

  const isImplemented = connector.implemented !== false; // Default to true if undefined

  const buttonBaseClasses = "w-full mt-6 font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed";
  
  const connectedButtonClasses = "bg-white hover:bg-brand-gray-100 text-brand-purple border border-brand-purple";
  const disconnectedButtonClasses = "bg-brand-purple-light hover:bg-purple-200 text-brand-purple";
  const unimplementedButtonClasses = "bg-brand-gray-200 text-brand-gray-500 cursor-not-allowed";

  const buttonClasses = `${buttonBaseClasses} ${!isImplemented ? unimplementedButtonClasses : (isConnected ? connectedButtonClasses : disconnectedButtonClasses)}`;
  const cardClasses = `bg-white p-6 rounded-xl border border-brand-gray-200 flex flex-col justify-between shadow-sm transition-all duration-300 ${isImplemented ? 'hover:shadow-lg hover:border-brand-purple/50' : 'opacity-60'}`;

  return (
    <div className={cardClasses}>
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-white rounded-lg border border-brand-gray-200 flex items-center justify-center">
            {connector.icon}
          </div>
          {isImplemented && isConnected ? (
            <span className="flex items-center text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 mr-1.5 bg-green-500 rounded-full"></span>
              Connected
            </span>
          ) : connector.addon && (
            <span className="text-xs font-semibold bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full">
              Add-on
            </span>
          )}
        </div>
        <h3 className="font-semibold text-gray-800">{connector.name}</h3>
        <p className="text-sm text-brand-gray-500 mt-1 h-10">{connector.description}</p>
      </div>
      <button 
        onClick={() => { if (isImplemented) { onClick(connector.id); } }}
        disabled={isLoading || !isImplemented}
        className={buttonClasses}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-brand-purple" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Connecting...
          </>
        ) : isImplemented ? (isConnected ? 'Configuration' : 'Connect your data') : 'Coming Soon'}
      </button>
    </div>
  );
};

export default ConnectorCard;
