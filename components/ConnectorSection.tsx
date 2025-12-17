
import React, { useState } from 'react';
import type { CategoryType, ConnectorConnection } from '../types';
import ConnectorCard from './ConnectorCard';
import { PlusIcon } from './icons';

interface ConnectorSectionProps {
  category: CategoryType;
  onConnect: (connectorId: string) => void;
  loadingConnectors: Record<string, boolean>;
  connectedConnectors: Record<string, ConnectorConnection[]>;
}

const ConnectorSection: React.FC<ConnectorSectionProps> = ({ category, onConnect, loadingConnectors, connectedConnectors }) => {
  const [showConfiguredOnly, setShowConfiguredOnly] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredConnectors = showConfiguredOnly
    ? category.connectors.filter(connector => {
        const connections = connectedConnectors[connector.id] || [];
        return connections.length > 0;
      })
    : category.connectors;

  const connectorsToDisplay = isExpanded ? filteredConnectors : filteredConnectors.slice(0, 4);

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-bold text-gray-800">{category.title}</h2>
      <div className="flex items-center space-x-6">
        <button onClick={() => alert('Connector request feature coming soon!')} className="flex items-center space-x-1.5 text-sm font-medium text-brand-purple hover:text-purple-800 transition-colors">
          <PlusIcon className="w-4 h-4" />
          <span>Request a connector</span>
        </button>
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-brand-gray-600">Show configured connectors only</span>
          <button
            onClick={() => {
              setShowConfiguredOnly(!showConfiguredOnly);
              setIsExpanded(false); // Reset expansion on filter change
            }}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
              showConfiguredOnly ? 'bg-brand-purple' : 'bg-brand-gray-300'
            }`}
          >
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                showConfiguredOnly ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  if (filteredConnectors.length === 0 && showConfiguredOnly) {
    return (
      <section>
        {renderHeader()}
        <div className="text-center py-6 bg-white rounded-xl border border-dashed border-brand-gray-300">
          <p className="text-sm text-brand-gray-500">No configured connectors in this category.</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      {renderHeader()}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {connectorsToDisplay.map(connector => {
          const connections = connectedConnectors[connector.id] || [];
          return (
            <ConnectorCard 
              key={connector.id} 
              connector={connector}
              onClick={onConnect}
              isLoading={loadingConnectors[connector.id] || false}
              connectionsCount={connections.length}
            />
          );
        })}
      </div>
      {filteredConnectors.length > 4 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm font-semibold text-brand-purple hover:text-purple-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 px-4 py-2 rounded-lg"
          >
            {isExpanded ? 'Show less' : `Show ${filteredConnectors.length - 4} more`}
          </button>
        </div>
      )}
    </section>
  );
};

export default ConnectorSection;
