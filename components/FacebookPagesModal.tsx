import React, { useState, useEffect, useCallback } from 'react';
import type { ApiResponse, FacebookPage, FacebookPageDetailsData } from '../types';
import { PersonasIcon, UserPlusIcon, EngagementIcon, LiveIcon, InformationCircleIcon, RetentionIcon, CreativeStudioIcon } from './icons';

interface FacebookPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE_URL = 'http://localhost:8200';

type FacebookMetric = {
  name: string;
  period: string;
  values: { value: any; end_time: string }[];
  title: string | null;
  description: string;
  id: string;
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; description: string }> = ({ title, value, icon, description }) => (
  <div className="bg-white p-4 rounded-lg border border-brand-gray-200 shadow-sm flex flex-col justify-between">
    <div>
      <div className="flex justify-between items-start text-brand-gray-500">
        <div className="w-8 h-8 rounded-full bg-brand-purple-light flex items-center justify-center text-brand-purple">
          {icon}
        </div>
        <div className="relative group">
          <InformationCircleIcon className="w-5 h-5 cursor-pointer" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {description}
          </div>
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-800 mt-4">{value}</p>
    </div>
    <p className="text-sm font-medium text-brand-gray-600 mt-1">{title}</p>
  </div>
);

const FacebookPagesModal: React.FC<FacebookPagesModalProps> = ({ isOpen, onClose }) => {
  const [view, setView] = useState<'selection' | 'details'>('selection');
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pageDetails, setPageDetails] = useState<FacebookPageDetailsData | null>(null);
  const [configuredPages, setConfiguredPages] = useState<FacebookPage[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setView('selection');
    setPages([]);
    setSelectedPages(new Set());
    setIsLoading(false);
    setIsSaving(false);
    setError(null);
    setPageDetails(null);
    setConfiguredPages([]);
    setActivePageId(null);
  }, []);

  const fetchPages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication token not found.');

      const response = await fetch(`${API_BASE_URL}/api/v1/data/facebook/pages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const result: ApiResponse<FacebookPage[]> = await response.json();
      
      if (!response.ok || (result.code !== 0 && result.code !== 200)) {
         throw new Error(result.message || 'Failed to fetch Facebook pages.');
      }
      
      setPages(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
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

  const handlePageSelect = (pageId: string) => {
    setSelectedPages(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(pageId)) {
        newSelected.delete(pageId);
      } else {
        newSelected.add(pageId);
      }
      return newSelected;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication token not found.');

      const pageIds = Array.from(selectedPages);
      if (pageIds.length === 0) {
        setIsSaving(false);
        return;
      }

      // The API is assumed to return a single object where keys are page IDs
      // and values are arrays of metric data.
      const response = await fetch(`${API_BASE_URL}/api/v1/data/facebook/pages/selected?page_ids=${pageIds.join(',')}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const result: ApiResponse<FacebookPageDetailsData> = await response.json();
      
      if (!response.ok || (result.code !== 0 && result.code !== 200)) {
        throw new Error(result.message || 'Failed to fetch page details.');
      }

      if (result.data) {
        // Handle cases where the API returns a single array for a single ID
        if (Array.isArray(result.data)) {
            const singlePageId = pageIds[0];
            if (singlePageId) {
                setPageDetails({ [singlePageId]: result.data as any });
            }
        } else {
            setPageDetails(result.data);
        }

        const savedPages = pages.filter(p => selectedPages.has(p.id));
        setConfiguredPages(savedPages);
        if (savedPages.length > 0) {
          setActivePageId(savedPages[0].id);
        }
        setView('details');
      } else {
        throw new Error('No data returned after saving configuration.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderSelectionView = () => (
    <div className="flex-grow overflow-y-auto pr-2">
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <svg className="animate-spin h-8 w-8 text-brand-purple" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>
      ) : error ? (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>
      ) : pages.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-brand-gray-500">Select the pages you want to track data for.</p>
          {pages.map(page => {
            const isSelected = selectedPages.has(page.id);
            return (
              <div key={page.id} onClick={() => handlePageSelect(page.id)} className={`w-full flex items-center justify-between p-4 rounded-lg border text-left transition-all duration-200 cursor-pointer ${isSelected ? 'bg-brand-purple-light border-brand-purple shadow-md' : 'bg-white hover:bg-brand-gray-100 border-brand-gray-200'}`}>
                <div className="flex items-center min-w-0">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-4 border-2 flex-shrink-0 ${isSelected ? 'bg-brand-purple border-brand-purple' : 'border-brand-gray-300'}`}>
                    {isSelected && <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate" title={page.name}>{page.name}</p>
                    <p className="text-xs text-brand-gray-500">ID: {page.id}</p>
                  </div>
                </div>
                {page.url && (
                    <a 
                      href={page.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      onClick={(e) => e.stopPropagation()}
                      className="ml-4 text-sm font-medium text-brand-purple hover:underline flex-shrink-0 flex items-center space-x-1"
                      aria-label={`Open ${page.name} in a new tab`}
                    >
                      <span>Open</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex justify-center items-center h-full text-center"><p className="text-sm text-brand-gray-500">No Facebook pages found for your account.</p></div>
      )}
    </div>
  );
  
  const renderDetailsView = () => {
    const activePage = configuredPages.find(p => p.id === activePageId);
    
    const getMetricValue = (pageId: string, name: string, period: string) => {
        if (!pageDetails || !pageDetails[pageId]) return { value: 'N/A', description: 'Data not available for this page.' };
        
        const pageData = pageDetails[pageId] as FacebookMetric[];
        const metric = pageData.find(m => m.name === name && m.period === period);
        if (!metric || !metric.values || metric.values.length === 0) return { value: 'N/A', description: `Metric "${name}" with period "${period}" not found.` };
        
        const latestEntry = metric.values[metric.values.length - 1];
        const description = metric.description || 'No description provided.';

        if (typeof latestEntry.value === 'number') {
            return { value: latestEntry.value.toLocaleString(), description };
        }
        if (typeof latestEntry.value === 'object' && latestEntry.value !== null) {
            const total = Object.values(latestEntry.value).reduce((sum: number, count: unknown) => sum + (typeof count === 'number' ? count : 0), 0);
            return { value: total.toLocaleString(), description };
        }
        return { value: 'N/A', description };
    };

    const { value: totalFans, description: totalFansDesc } = activePageId ? getMetricValue(activePageId, 'page_fans', 'day') : { value: 'N/A', description: '' };
    const { value: newLikes, description: newLikesDesc } = activePageId ? getMetricValue(activePageId, 'page_fan_adds_unique', 'day') : { value: 'N/A', description: '' };
    const { value: postReactions, description: postReactionsDesc } = activePageId ? getMetricValue(activePageId, 'page_actions_post_reactions_total', 'days_28') : { value: 'N/A', description: '' };
    const { value: videoViews, description: videoViewsDesc } = activePageId ? getMetricValue(activePageId, 'page_video_views_unique', 'days_28') : { value: 'N/A', description: '' };
    const { value: weeklyVideoViews, description: weeklyVideoViewsDesc } = activePageId ? getMetricValue(activePageId, 'page_video_views_unique', 'week') : { value: 'N/A', description: '' };
    const { value: thirtySecondVideoViews, description: thirtySecondVideoViewsDesc } = activePageId ? getMetricValue(activePageId, 'page_video_complete_views_30s_unique', 'days_28') : { value: 'N/A', description: '' };


    return (
      <div className="flex-grow flex min-h-0">
        <div className="w-1/3 pr-6 border-r border-brand-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Configured Pages</h3>
          <div className="space-y-2 bg-brand-gray-100 p-2 rounded-lg border border-brand-gray-200 h-[calc(100%-40px)] overflow-y-auto">
            {configuredPages.map((page) => (
              <button key={page.id} onClick={() => setActivePageId(page.id)} className={`w-full flex items-center p-2.5 rounded-md shadow-sm transition-colors text-left ${activePageId === page.id ? 'bg-brand-purple-light' : 'bg-white hover:bg-brand-gray-200'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <span className="text-sm text-brand-gray-600 font-medium truncate" title={page.name}>{page.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="w-2/3 pl-6 flex flex-col overflow-y-auto">
          {activePage ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 truncate" title={activePage.name}>
                  Showing data for: <span className="text-brand-purple">{activePage.name}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard title="Total Page Fans" value={totalFans} description={totalFansDesc} icon={<PersonasIcon className="w-5 h-5"/>} />
                  <StatCard title="Daily New Fans" value={newLikes} description={newLikesDesc} icon={<UserPlusIcon className="w-5 h-5"/>} />
                  <StatCard title="Post Reactions (28 Days)" value={postReactions} description={postReactionsDesc} icon={<EngagementIcon className="w-5 h-5"/>} />
                  <StatCard title="Video Views (28 Days)" value={videoViews} description={videoViewsDesc} icon={<LiveIcon className="w-5 h-5"/>} />
                  <StatCard title="Weekly Video Views" value={weeklyVideoViews} description={weeklyVideoViewsDesc} icon={<RetentionIcon className="w-5 h-5"/>} />
                  <StatCard title="30s Video Views (28 Days)" value={thirtySecondVideoViews} description={thirtySecondVideoViewsDesc} icon={<CreativeStudioIcon className="w-5 h-5"/>} />
              </div>
            </div>
          ) : <p className="mt-4 text-sm text-brand-gray-500">Select a page to view its data.</p>}
        </div>
      </div>
    );
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center transition-opacity duration-300" aria-modal="true" role="dialog" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-5xl m-4 transform transition-transform duration-300 scale-100 flex flex-col h-[80vh]" onClick={e => e.stopPropagation()}>
        <div className="flex-shrink-0 flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Configure Facebook Pages</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close modal"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        
        {view === 'selection' ? renderSelectionView() : renderDetailsView()}
        {error && view === 'selection' && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="flex-shrink-0 mt-8 flex justify-end space-x-3">
          {view === 'selection' ? (
            <>
              <button type="button" onClick={onClose} className="px-6 py-2.5 bg-brand-gray-200 border border-transparent text-brand-gray-600 font-semibold rounded-lg hover:bg-brand-gray-300 transition-colors text-sm">Cancel</button>
              <button type="button" onClick={handleSave} disabled={selectedPages.size === 0 || isLoading || isSaving} className="px-6 py-2.5 bg-brand-purple border border-transparent text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center min-w-[200px]">
                {isSaving ? (
                  <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Saving...</>
                ) : 'Save Configuration'}
              </button>
            </>
          ) : (
             <>
               <button type="button" onClick={() => setView('selection')} className="px-6 py-2.5 bg-brand-gray-200 border border-transparent text-brand-gray-600 font-semibold rounded-lg hover:bg-brand-gray-300 transition-colors text-sm">Back to Selection</button>
               <button type="button" onClick={onClose} className="px-6 py-2.5 bg-brand-purple border border-transparent text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors text-sm">Done</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacebookPagesModal;