
import React, { useState, useEffect, useCallback } from 'react';
import type { ApiResponse, FacebookPage, FacebookPageDetailsData } from '../types';
import { PlusIcon } from './icons';

interface FacebookPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Define specific interface for the new API response format
interface PageResponseItem {
    page_id: string;
    name: string;
    is_active: boolean;
    access_token?: string;
}

const API_BASE_URL = 'http://localhost:8001';

type ConnectionStatus = 'idle' | 'loading' | 'success' | 'error';

const FacebookPagesModal: React.FC<FacebookPagesModalProps> = ({ isOpen, onClose }) => {
  const [pages, setPages] = useState<PageResponseItem[]>([]);
  
  // Connection status per page
  const [pageConnectionStatuses, setPageConnectionStatuses] = useState<Record<string, ConnectionStatus>>({});

  // General state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setPages([]);
    setPageConnectionStatuses({});
    setIsLoading(false);
    setError(null);
    setSuccessMessage(null);
  }, []);

  const fetchPages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication token not found.');

      // Hardcoded provider_user_id as requested
      const response = await fetch(`${API_BASE_URL}/api/v1/data/facebook-pages/accounts/pages?provider_user_id=2084874412331769`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result: ApiResponse<Record<string, PageResponseItem>> = await response.json();

      // Check for code 200 as per the user's JSON example, or 0 which is the app standard
      if (!response.ok || (result.code !== 200 && result.code !== 0)) {
        throw new Error(result.message || 'Failed to fetch Facebook pages.');
      }
      
      const pagesData = result.data || {};
      const pagesArray = Object.values(pagesData);
      setPages(pagesArray);
      setSuccessMessage('Successfully retrieved Facebook pages');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setSuccessMessage(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchPages();
    } else {
      resetState();
    }
  }, [isOpen, fetchPages, resetState]);

  const handleConnectPageSource = async (page: PageResponseItem) => {
    setPageConnectionStatuses(prev => ({ ...prev, [page.page_id]: 'loading' }));

    try {
        const token = localStorage.getItem('authToken');
        
        // Corrected URL to port 8001 as requested
        const response = await fetch(`http://localhost:8001/api/v1/data/facebook_pages/create_source`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
                name: page.name,
                access_token: page.access_token || '', // Handle optional access_token
                page_id: page.page_id
            })
        });

        if (response.ok) {
            setPageConnectionStatuses(prev => ({ ...prev, [page.page_id]: 'success' }));
        } else {
             setPageConnectionStatuses(prev => ({ ...prev, [page.page_id]: 'error' }));
        }

    } catch (error) {
        console.error("Failed to connect page source", error);
        setPageConnectionStatuses(prev => ({ ...prev, [page.page_id]: 'error' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center transition-opacity duration-300" aria-modal="true" role="dialog" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl m-4 transform transition-transform duration-300 scale-100 flex flex-col h-[80vh]" onClick={e => e.stopPropagation()}>
        <div className="flex-shrink-0 flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Configure Facebook Pages</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close modal"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        
        <div className="flex-grow min-h-0 flex flex-col overflow-y-auto pr-2">
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-brand-gray-500">Select a page to connect as a data source.</p>
            </div>
            
            {isLoading ? (
                <div className="flex justify-center items-center h-full">
                    <svg className="animate-spin h-8 w-8 text-brand-purple" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </div>
            ) : pages.length > 0 ? (
                <div className="space-y-3">
                    {pages.map(page => {
                        const status = pageConnectionStatuses[page.page_id] || 'idle';
                        return (
                            <div key={page.page_id} className="w-full flex items-center justify-between p-4 rounded-md border border-brand-gray-200 bg-white hover:bg-brand-gray-50 transition-colors">
                                <div className="min-w-0 pr-4 flex-1">
                                    <p className="font-bold text-gray-800 truncate" title={page.name}>
                                        {page.name}
                                    </p>
                                    <p className="text-xs text-brand-gray-500 font-mono mt-1">Page ID: {page.page_id}</p>
                                </div>
                                
                                <button
                                    onClick={() => handleConnectPageSource(page)}
                                    disabled={status === 'loading' || status === 'success'}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors min-w-[150px] flex items-center justify-center flex-shrink-0 ${
                                        status === 'success' 
                                            ? 'bg-green-100 text-green-700 border border-green-200 cursor-default'
                                            : status === 'error'
                                                ? 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200'
                                                : status === 'loading'
                                                    ? 'bg-brand-gray-100 text-brand-gray-500 cursor-wait'
                                                    : 'bg-brand-purple text-white hover:bg-purple-700'
                                    }`}
                                >
                                    {status === 'loading' && (
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    )}
                                    {status === 'idle' && 'Connect to page'}
                                    {status === 'loading' && 'Connecting...'}
                                    {status === 'success' && (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                            Connected
                                        </>
                                    )}
                                    {status === 'error' && (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                                            Retry
                                        </>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex justify-center items-center h-full text-center"><p className="text-sm text-brand-gray-500">No pages found.</p></div>
            )}
        </div>
        
        {successMessage && <p className="mt-4 text-sm text-green-600 text-center">{successMessage}</p>}
        {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}
        
        <div className="flex-shrink-0 mt-8 flex justify-end space-x-3">
             <button type="button" onClick={onClose} className="px-6 py-2.5 bg-brand-gray-200 border border-transparent text-brand-gray-600 font-semibold rounded-lg hover:bg-brand-gray-300 transition-colors text-sm">Close</button>
        </div>
      </div>
    </div>
  );
};

export default FacebookPagesModal;
