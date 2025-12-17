
import React, { useState, useEffect, useCallback } from 'react';
import type { ApiResponse, GoogleSheetInfo, ConfiguredSheetsData, Spreadsheet, SpreadsheetDetailsData } from '../types';

interface GoogleSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sheetId: string) => Promise<GoogleSheetInfo[]>;
}

interface GoogleApiInfoResponseData {
  access_token: string;
  APP_ID: string;
  API_KEY: string;
  CLIENT_ID: string;
}

declare global {
  interface Window {
    gapiLoaded: () => void;
    gisLoaded: () => void;
    gapi: any;
    google: any;
  }
}

const API_BASE_URL = 'http://localhost:8200';

const GoogleDriveIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <path fill="#FFC107" d="M179.9,384l-31.8-55.1L27,221.7l31.8,55.1l121.1,107.2H179.9z"/>
    <path fill="#1976D2" d="M485,221.7L325.2,496h-152L333,221.7H485z"/>
    <path fill="#4CAF50" d="M148.1,328.9L27,221.7l140-123.5l121.1,107.2L148.1,328.9z"/>
    <path fill="#2196F3" d="M333,221.7l32.7-57.5L205.9,16,58,221.7H333z"/>
  </svg>
);

interface ProcessingSheet {
  id: string;
  name: string;
  status: 'processing' | 'success' | 'error';
  result?: GoogleSheetInfo[];
  error?: string;
}

const GoogleSheetModal: React.FC<GoogleSheetModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pickerError, setPickerError] = useState<string | null>(null);
  const [processingSheets, setProcessingSheets] = useState<ProcessingSheet[]>([]);

  const [viewState, setViewState] = useState<'add' | 'view'>('add');
  
  const [configuredSheets, setConfiguredSheets] = useState<Spreadsheet[]>([]);
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);
  const [loadSheetsError, setLoadSheetsError] = useState<string | null>(null);

  const [selectedSheet, setSelectedSheet] = useState<Spreadsheet | null>(null);
  const [selectedSheetDetails, setSelectedSheetDetails] = useState<SpreadsheetDetailsData | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [activeSheetTab, setActiveSheetTab] = useState<string | null>(null);

  const [pickerApiLoaded, setPickerApiLoaded] = useState(false);

  const fetchConfiguredSheets = useCallback(async () => {
    setIsLoadingSheets(true);
    setLoadSheetsError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication token not found.');

      const response = await fetch(`${API_BASE_URL}/api/v1/data/google_sheets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result: ApiResponse<ConfiguredSheetsData> = await response.json();

      if (!response.ok || result.code !== 0) {
        throw new Error(result.message || 'Failed to fetch configured sheets.');
      }
      setConfiguredSheets(result.data?.spreadsheets || []);
    } catch (err) {
      setLoadSheetsError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoadingSheets(false);
    }
  }, []);

  const pickerCallback = useCallback(async (data: any) => {
    if (data.action === window.google.picker.Action.PICKED) {
        const docs = data[window.google.picker.Response.DOCUMENTS];
        if (!docs || docs.length === 0) {
            return;
        }

        setIsSubmitting(true);
        setPickerError(null);
        const initialProcessingSheets: ProcessingSheet[] = docs.map((doc: any) => ({
            id: doc[window.google.picker.Document.ID],
            name: doc[window.google.picker.Document.NAME],
            status: 'processing' as const,
        }));
        setProcessingSheets(initialProcessingSheets);

        const processDoc = async (doc: any) => {
            const fileId = doc[window.google.picker.Document.ID];
            try {
                const newSheets = await onSubmit(fileId);
                setProcessingSheets(prev => prev.map(sheet => 
                    sheet.id === fileId ? { ...sheet, status: 'success', result: newSheets } : sheet
                ));
            } catch (err) {
                setProcessingSheets(prev => prev.map(sheet => 
                    sheet.id === fileId ? { ...sheet, status: 'error', error: err instanceof Error ? err.message : 'An unknown error occurred.' } : sheet
                ));
            }
        };

        await Promise.all(docs.map(processDoc));

        await fetchConfiguredSheets();
        setIsSubmitting(false);
    }
  }, [onSubmit, fetchConfiguredSheets]);
  
  const createPicker = useCallback((accessToken: string, apiKey: string, appId: string) => {
    if (!pickerApiLoaded) {
      setPickerError("Picker API is not ready. Please wait a moment and try again.");
      return;
    }
    const viewSpreadsheets = new window.google.picker.DocsView(window.google.picker.ViewId.SPREADSHEETS)
      .setIncludeFolders(true)
      .setSelectFolderEnabled(true);

    const picker = new window.google.picker.PickerBuilder()
      .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
      .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
      .setAppId(appId)
      .setOAuthToken(accessToken)
      .setDeveloperKey(apiKey)
      .addView(viewSpreadsheets)
      .setCallback(pickerCallback)
      .build();

    picker.setVisible(true);

  }, [pickerApiLoaded, pickerCallback]);

  useEffect(() => {
    if (isOpen) {
      window.gapiLoaded = () => {
        if (window.gapi && window.gapi.load) {
          window.gapi.load('picker', () => {
            setPickerApiLoaded(true);
          });
        }
      };

      window.gisLoaded = () => {};

      if (window.gapi && window.gapi.load) {
        window.gapi.load('picker', () => setPickerApiLoaded(true));
      }
    }
  }, [isOpen]);

  const handleSelectFromDrive = async () => {
    setProcessingSheets([]);
    setPickerError(null);
    try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Authentication token not found.');

        const response = await fetch(`${API_BASE_URL}/api/v1/data/google_sheets/api-secret`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const result: ApiResponse<GoogleApiInfoResponseData> = await response.json();

        if (!response.ok || result.code !== 0 || !result.data) {
            throw new Error(result.message || 'Failed to fetch Google API credentials.');
        }

        const { access_token, API_KEY, APP_ID } = result.data;
        
        createPicker(access_token, API_KEY, APP_ID);
    } catch (err) {
        setPickerError(err instanceof Error ? err.message : 'An unknown error occurred.');
    }
  };
  
  const handleSheetSelect = async (sheet: Spreadsheet) => {
    setViewState('view');
    setSelectedSheet(sheet);
    setIsLoadingDetails(true);
    setDetailsError(null);
    setSelectedSheetDetails(null);
    try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Authentication token not found.');

        const response = await fetch(`${API_BASE_URL}/api/v1/data/google_sheets/${sheet.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result: ApiResponse<SpreadsheetDetailsData> = await response.json();

        if (!response.ok || result.code !== 0) {
            throw new Error(result.message || 'Failed to fetch sheet details.');
        }
        
        if (result.data) {
          setSelectedSheetDetails(result.data);
          if (result.data.sheets.length > 0) {
            setActiveSheetTab(result.data.sheets[0].sheet_name);
          }
        } else {
          throw new Error("No data returned for this sheet.");
        }
    } catch (err) {
        setDetailsError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
        setIsLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchConfiguredSheets();
    }
  }, [isOpen, fetchConfiguredSheets]);

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    setIsSubmitting(false);
    setPickerError(null);
    setProcessingSheets([]);
    setConfiguredSheets([]);
    setIsLoadingSheets(false);
    setLoadSheetsError(null);
    setViewState('add');
    setSelectedSheet(null);
    setSelectedSheetDetails(null);
    setIsLoadingDetails(false);
    setDetailsError(null);
    setActiveSheetTab(null);
    onClose();
  };
  
  const renderLeftPanel = () => (
    <div className="w-1/3 pr-6 border-r border-brand-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Configured Sheets</h3>
      {isLoadingSheets ? (
        <div className="flex justify-center items-center h-full">
           <svg className="animate-spin h-8 w-8 text-brand-purple" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>
      ) : loadSheetsError ? (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{loadSheetsError}</div>
      ) : (
        <div className="space-y-2 bg-brand-gray-100 p-2 rounded-lg border border-brand-gray-200 h-[calc(100%-40px)] overflow-y-auto">
          {configuredSheets.length > 0 ? (
            configuredSheets.map((sheet) => (
              <button key={sheet.id} onClick={() => handleSheetSelect(sheet)} className={`w-full flex items-center p-2.5 rounded-md shadow-sm transition-colors text-left ${selectedSheet?.id === sheet.id ? 'bg-brand-purple-light' : 'bg-white hover:bg-brand-gray-200'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <span className="text-sm text-brand-gray-600 font-medium truncate" title={sheet.name}>{sheet.name}</span>
              </button>
            ))
          ) : (
            <div className="flex justify-center items-center h-full"><p className="text-sm text-brand-gray-500">No sheets configured yet.</p></div>
          )}
        </div>
      )}
    </div>
  );
  
  const renderAddView = () => {
    const isPickerReady = pickerApiLoaded;
    return (
        <>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Sheet</h3>
        <div className="flex flex-col">
            <p className="text-sm text-brand-gray-500 mb-6">Select one or more Google Sheets from your Drive to start crawling data.</p>
            
            <button 
                type="button" 
                onClick={handleSelectFromDrive}
                className="px-6 py-2.5 bg-white border border-brand-gray-300 hover:bg-brand-gray-100 text-brand-gray-600 font-semibold rounded-lg transition-colors text-sm flex items-center justify-center min-w-[240px] disabled:opacity-50 disabled:cursor-wait"
                disabled={!isPickerReady || isSubmitting}
            >
                {isSubmitting ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Processing...
                    </>
                ) : isPickerReady ? (
                     <>
                        <GoogleDriveIcon className="w-5 h-5 mr-2" />
                        Select from Google Drive
                     </>
                ) : (
                    'Loading Picker...'
                )}
            </button>

            {pickerError && <p className="text-sm text-red-600 mt-4">{pickerError}</p>}
            
            {processingSheets.length > 0 && (
              <div className="mt-4 p-3 bg-brand-gray-100 border border-brand-gray-200 rounded-lg max-h-60 overflow-y-auto space-y-3">
                {processingSheets.map(sheet => (
                  <div key={sheet.id} className="p-3 bg-white rounded-md border border-brand-gray-200">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-brand-gray-800 truncate" title={sheet.name}>{sheet.name}</p>
                      {sheet.status === 'processing' && (
                        <svg className="animate-spin h-5 w-5 text-brand-purple" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      )}
                      {sheet.status === 'success' && (
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      )}
                      {sheet.status === 'error' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                      )}
                    </div>
                    {sheet.status === 'success' && sheet.result && (
                      <div className="mt-2 pl-2 border-l-2 border-green-200">
                        <p className="text-xs text-green-700 mb-1">Sheets added:</p>
                        <ul className="text-xs text-brand-gray-600 space-y-0.5">
                          {sheet.result.map(s => <li key={s.document_id + s.sheet_name} className="truncate" title={s.sheet_name}>- {s.sheet_name}</li>)}
                        </ul>
                      </div>
                    )}
                    {sheet.status === 'error' && sheet.error && (
                       <p className="mt-2 text-xs text-red-600">{sheet.error}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
        </div>
        </>
    );
  };

  const renderDetailsView = () => {
    if (isLoadingDetails) {
        return <div className="flex justify-center items-center h-full w-full"><svg className="animate-spin h-8 w-8 text-brand-purple" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>
    }
    if (detailsError) {
        return <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{detailsError}</div>
    }
    if (!selectedSheetDetails) {
        return <div className="flex justify-center items-center h-full"><p className="text-sm text-brand-gray-500">Select a sheet from the left to view its details.</p></div>;
    }

    const activeSheetData = selectedSheetDetails.sheets.find(s => s.sheet_name === activeSheetTab);

    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 truncate" title={selectedSheet?.name}>{selectedSheet?.name}</h3>
                    <button onClick={() => setViewState('add')} className="text-sm font-medium text-brand-purple hover:underline">Add another sheet</button>
                </div>
                <div className="border-b border-brand-gray-300">
                  <nav className="-mb-px flex space-x-4 overflow-x-auto">
                      {selectedSheetDetails.sheets.map(sheet => (
                          <button key={sheet.sheet_name} onClick={() => setActiveSheetTab(sheet.sheet_name)} className={`py-2 px-1 text-sm font-medium whitespace-nowrap ${activeSheetTab === sheet.sheet_name ? 'border-b-2 border-brand-purple text-brand-purple' : 'border-b-2 border-transparent text-brand-gray-500 hover:text-gray-700'}`}>
                              {sheet.sheet_name}
                          </button>
                      ))}
                  </nav>
                </div>
            </div>
            {activeSheetData ? (
                <div className="flex-grow mt-4 overflow-hidden">
                    <pre className="bg-gray-800 text-white text-xs rounded-lg p-4 h-full overflow-auto">
                        <code>
                            {JSON.stringify(activeSheetData.data, null, 2)}
                        </code>
                    </pre>
                </div>
            ) : <p className="mt-4 text-sm text-brand-gray-500">Select a tab to view its data.</p>}
        </div>
    );
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center transition-opacity duration-300" aria-modal="true" role="dialog" onClick={handleClose}>
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-6xl m-4 transform transition-transform duration-300 scale-100 flex flex-col h-[80vh]" onClick={e => e.stopPropagation()}>
        <div className="flex-shrink-0 flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Manage Google Sheets Connection</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600" aria-label="Close modal"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <div className="flex-grow flex min-h-0">
          {renderLeftPanel()}
          <div className="w-2/3 pl-6">
            {viewState === 'add' ? renderAddView() : renderDetailsView()}
          </div>
        </div>
        <div className="flex-shrink-0 mt-8 flex justify-end">
          <button type="button" onClick={handleClose} className="px-6 py-2.5 bg-brand-gray-200 border border-transparent text-brand-gray-600 font-semibold rounded-lg hover:bg-brand-gray-300 transition-colors text-sm">Done</button>
        </div>
      </div>
    </div>
  );
};

export default GoogleSheetModal;
