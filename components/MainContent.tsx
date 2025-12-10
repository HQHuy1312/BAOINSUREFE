
import React, { useState, useEffect } from 'react';
import { CONNECTOR_CATEGORIES, TABS } from '../constants';
import ConnectorSection from './ConnectorSection';
import GoogleSheetModal from './GoogleSheetModal';
import FacebookPagesModal from './FacebookPagesModal';
import ConnectorDetailsModal from './ConnectorDetailsModal';
import type { ApiResponse, ConnectorStatusResponseData, GoogleSheetInfo, ConnectorConnection } from '../types';

const API_BASE_URL = 'http://localhost:8200';

const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [showWelcome, setShowWelcome] = useState(true);
  
  // Store list of connections for each connector ID
  const [connectedConnectors, setConnectedConnectors] = useState<Record<string, ConnectorConnection[]>>({});
  
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(true);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [isFacebookModalOpen, setIsFacebookModalOpen] = useState(false);
  const [loadingConnectors, setLoadingConnectors] = useState<Record<string, boolean>>({});

  // Details Modal State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedConnectorDetails, setSelectedConnectorDetails] = useState<{name: string, id: string, connections: ConnectorConnection[]} | null>(null);


  const getFrontendIdFromApiName = (apiName: string): string | null => {
    // Logic to map API names (e.g. tiktok_shop_connection_123) to Frontend IDs (e.g. tiktok-shop)
    if (apiName.startsWith('tiktok_shop')) return 'tiktok-shop';
    if (apiName.startsWith('google_sheets')) return 'google-sheets';
    if (apiName.startsWith('facebook_pages')) return 'facebook-pages';
    // Add more mappings as needed
    return null;
  };

  const fetchConnectorStatuses = async () => {
    setIsLoadingStatuses(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsLoadingStatuses(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/app/connectors/status`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const result: ApiResponse<ConnectorStatusResponseData> = await response.json();

      if (response.ok && result.code === 0 && result.data?.connectors) {
        const newConnectedState: Record<string, ConnectorConnection[]> = {};

        result.data.connectors.forEach(conn => {
            const frontendId = getFrontendIdFromApiName(conn.name);
            if (frontendId) {
                if (!newConnectedState[frontendId]) {
                    newConnectedState[frontendId] = [];
                }
                newConnectedState[frontendId].push(conn);
            }
        });
        
        // Preserve local optimistic updates if API doesn't return them yet (optional, but good for UX)
        // For now, let's strictly trust the API.
        
        setConnectedConnectors(newConnectedState);
      } else {
        console.error('Failed to fetch connector statuses:', result.message);
      }
    } catch (error) {
      console.error('Error fetching connector statuses:', error);
    } finally {
      setIsLoadingStatuses(false);
    }
  };

  useEffect(() => {
    fetchConnectorStatuses();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authSuccess = urlParams.get('google_auth_success');
    const facebookAuthSuccess = urlParams.get('facebook-pages_auth_success');

    if (authSuccess === 'true') {
      setIsSheetModalOpen(true);
      fetchConnectorStatuses(); // Refresh status
      const newUrl = `${window.location.pathname}`;
      window.history.replaceState({}, document.title, newUrl);
    }

    if (facebookAuthSuccess === 'true') {
      fetchConnectorStatuses(); // Refresh status
      const newUrl = `${window.location.pathname}`;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  const getGoogleAuthUrl = async (): Promise<string> => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/google_sheets/url`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result: ApiResponse<{ auth_url: string }> = await response.json();

    if (!response.ok || result.code !== 0) {
      throw new Error(result.message || 'Failed to retrieve Google authentication URL.');
    }

    if (!result.data?.auth_url) {
        throw new Error('Authentication URL not found in the API response.');
    }

    return result.data.auth_url;
  };

  const getFacebookAuthUrl = async (): Promise<string> => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/facebook-pages/url`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result: ApiResponse<{ url: string }> = await response.json();

    if (!response.ok || result.code !== 0) {
      throw new Error(result.message || 'Failed to retrieve Facebook authentication URL.');
    }

    if (!result.data?.url) {
        throw new Error('Authentication URL not found in the API response.');
    }

    return result.data.url;
  };

  const getTikTokShopAuthUrl = async (): Promise<string> => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/tiktok_shop/url`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result: ApiResponse<{ auth_url: string }> = await response.json();

    if (!response.ok || result.code !== 0) {
      throw new Error(result.message || 'Failed to retrieve TikTok Shop authentication URL.');
    }

    if (!result.data?.auth_url) {
        throw new Error('Authentication URL not found in the API response.');
    }

    return result.data.auth_url;
  };

  const executeAuthFlow = async (connectorId: string) => {
    if (connectorId === 'tiktok-shop') {
      setLoadingConnectors(prev => ({ ...prev, [connectorId]: true }));
      try {
        const authUrl = await getTikTokShopAuthUrl();
        const width = 800;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        
        window.open(
          authUrl, 
          'TikTokShopAuth', 
          `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
        );
      } catch (error) {
        if (error instanceof Error) {
            alert(`Error: ${error.message}`);
        } else {
            alert('An unknown error occurred.');
        }
      } finally {
        setLoadingConnectors(prev => ({ ...prev, [connectorId]: false }));
      }
      return;
    }

    if (connectorId.startsWith('google-')) {
        if (connectorId === 'google-sheets') {
             // For Google Sheets, we might still want to open the modal first if configured,
             // but here we are in the "Add New" flow.
             setLoadingConnectors(prev => ({ ...prev, [connectorId]: true }));
             try {
                const authUrl = await getGoogleAuthUrl();
                window.location.href = authUrl;
             } catch (error) {
                if (error instanceof Error) {
                    alert(`Error: ${error.message}`);
                } else {
                    alert('An unknown error occurred.');
                }
                setLoadingConnectors(prev => ({ ...prev, [connectorId]: false }));
             }
        }
        return;
    }

    if (connectorId.startsWith('facebook-')) {
        if (connectorId === 'facebook-pages') {
            // If checking specifically for authentication vs configuration
            setLoadingConnectors(prev => ({ ...prev, [connectorId]: true }));
            try {
                const authUrl = await getFacebookAuthUrl();
                window.location.href = authUrl;
            } catch (error) {
                if (error instanceof Error) {
                    alert(`Error: ${error.message}`);
                } else {
                    alert('An unknown error occurred.');
                }
                setLoadingConnectors(prev => ({ ...prev, [connectorId]: false }));
            }
        }
        return;
    }

    alert(`Connection logic for "${connectorId}" is not implemented yet.`);
  }

  const handleConnect = async (connectorId: string) => {
    const existingConnections = connectedConnectors[connectorId] || [];

    // Special handling for legacy/complex modals like Google Sheets or FB Pages configuration
    if (connectorId === 'google-sheets' && existingConnections.length > 0) {
        setIsSheetModalOpen(true);
        return;
    }
    
    // For Facebook Pages, if connected, we usually open the specific page configuration modal
    if (connectorId === 'facebook-pages' && existingConnections.length > 0) {
        setIsFacebookModalOpen(true);
        return;
    }

    if (existingConnections.length > 0) {
        // Show list of connected shops
        // Find the friendly name for the title
        let category = CONNECTOR_CATEGORIES.find(c => c.connectors.some(conn => conn.id === connectorId));
        let connector = category?.connectors.find(c => c.id === connectorId);
        
        setSelectedConnectorDetails({
            name: connector?.name || connectorId,
            id: connectorId,
            connections: existingConnections
        });
        setIsDetailsModalOpen(true);
    } else {
        // Not connected yet, start auth flow
        await executeAuthFlow(connectorId);
    }
  };

  const handleSheetSubmit = async (sheetInput: string): Promise<GoogleSheetInfo[]> => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication token not found.');
    }
    
    const regex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
    const match = sheetInput.match(regex);
    const spreadsheetId = match ? match[1] : sheetInput;

    const response = await fetch(`${API_BASE_URL}/api/v1/data/google_sheets/fetch?spreadsheet_id=${spreadsheetId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result: ApiResponse<GoogleSheetInfo[]> = await response.json();
    
    if (!response.ok || (result.code !== 0 && result.code !== 200)) {
      throw new Error(result.message || 'Failed to fetch data from Google Sheet.');
    }

    if (!result.data) {
      throw new Error('No sheet data returned from the Google Sheet.');
    }
    
    console.log('Successfully fetched data from sheets:', result.data);
    return result.data;
  };

  const filteredCategories = activeTab === 'All'
    ? CONNECTOR_CATEGORIES
    : CONNECTOR_CATEGORIES.filter(cat => cat.title === activeTab);

  return (
    <>
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Connectors</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-x-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search for a connector..."
                className="pl-10 pr-4 py-2 border border-brand-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none"
              />
            </div>
            <button className="bg-brand-purple hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>Request new</span>
            </button>
          </div>
        </div>
        
        <div className="border-b border-brand-gray-300">
          <nav className="-mb-px flex space-x-6 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 text-sm font-medium whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-b-2 border-brand-purple text-brand-purple'
                    : 'border-b-2 border-transparent text-brand-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
        
        {showWelcome && (
          <div className="bg-white p-6 rounded-xl shadow-sm flex justify-between items-start border border-brand-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">Welcome to the Connectors page</h2>
              <p className="text-brand-gray-500">Connect 45+ data sources quickly and easily.</p>
            </div>
            <button onClick={() => setShowWelcome(false)} className="text-gray-400 hover:text-gray-600">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
            </button>
          </div>
        )}

        <div className="space-y-12">
          {isLoadingStatuses ? (
            <div className="text-center py-10">
              <p className="text-brand-gray-500">Loading connectors...</p>
            </div>
          ) : filteredCategories.map(category => (
            <ConnectorSection 
              key={category.id} 
              category={category}
              onConnect={handleConnect}
              loadingConnectors={loadingConnectors}
              connectedConnectors={connectedConnectors}
            />
          ))}
        </div>
      </div>
      
      <GoogleSheetModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        onSubmit={handleSheetSubmit}
      />
      
      <FacebookPagesModal
        isOpen={isFacebookModalOpen}
        onClose={() => setIsFacebookModalOpen(false)}
      />

      <ConnectorDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        connectorName={selectedConnectorDetails?.name || 'Connector'}
        connections={selectedConnectorDetails?.connections || []}
        onAddNew={() => {
            if (selectedConnectorDetails) {
                // Close modal and start auth flow
                // We keep the modal open? Or close it?
                // Usually good to close it or handle the popup logic while it stays open.
                // Given logic, let's close modal then trigger auth.
                // setIsDetailsModalOpen(false); 
                // Actually, executeAuthFlow can run while modal is open (popup).
                executeAuthFlow(selectedConnectorDetails.id);
            }
        }}
      />
    </>
  );
};

export default MainContent;