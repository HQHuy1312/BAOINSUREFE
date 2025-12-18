import React, { useState, useEffect, useCallback } from 'react';
import type { ApiResponse } from '../types';

interface FacebookPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE_URL = 'http://localhost:8200';

interface FBPageInfo {
  page_id: string;
  page_name: string;
  page_access_token: string;
  has_airbyte_source: boolean;
  airbyte_source_id: string | null;
  airbyte_source_config: any;
}

interface FBAccountProvider {
  provider_id: string;
  provider_name: string;
  provider_email: string;
  user_id: number;
  pages: Record<string, FBPageInfo>;
}

const truncate = (str: string, n: number) => (str && str.length > n ? str.slice(0, n - 1) + '...' : str);

const FacebookPagesModal: React.FC<FacebookPagesModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'empty' | 'success' | 'error'>('idle');
  const [accounts, setAccounts] = useState<FBAccountProvider[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchAllAccountsAndPages = useCallback(async () => {
    setStatus('loading');
    setErrorMessage(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication token not found.');

      // Gọi API lấy tất cả accounts và trạng thái Airbyte
      const response = await fetch(`${API_BASE_URL}/api/v1/data/facebook-pages/all-accounts`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      const result = await response.json();
      
      if (result.code === 200 || result.code === 0) {
        if (!result.data || result.data.length === 0) {
          setStatus('empty');
        } else {
          setAccounts(result.data);
          setStatus('success');
        }
      } else {
        throw new Error(result.message || 'Failed to fetch Facebook accounts');
      }
    } catch (err: any) {
      setErrorMessage(err.message);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchAllAccountsAndPages();
    } else {
      setStatus('idle');
      setAccounts([]);
      setErrorMessage(null);
    }
  }, [isOpen, fetchAllAccountsAndPages]);

  const handleVerify = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/facebook-pages/url`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const result: ApiResponse<{ auth_url: string }> = await response.json();
      if (result.code === 0 && result.data?.auth_url) {
        window.location.href = result.data.auth_url;
      } else {
        alert(result.message || 'Failed to get verification URL');
      }
    } catch (err) {
      alert('Error initiating verification');
    }
  };

  const handleConnectPage = async (page: FBPageInfo) => {
    setProcessingId(page.page_id);
    try {
      const token = localStorage.getItem('authToken');
      
      // Gọi endpoint tạo source và connection tới MongoDB
      const response = await fetch(`${API_BASE_URL}/api/v1/app/airbyte/sources/facebook-pages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          name: page.page_name,
          access_token: page.page_access_token,
          page_id: page.page_id
        }),
      });
      const result = await response.json();
      if (result.code === 200 || result.code === 0) {
        // Sau khi tạo xong, reload lại để cập nhật nút sang "Disconnect"
        await fetchAllAccountsAndPages();
      } else {
        alert(result.message || 'Failed to connect to page');
      }
    } catch (err) {
      alert('Error connecting to page');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDisconnectPage = async (page: FBPageInfo) => {
    if (!page.airbyte_source_id) return;
    
    if (!window.confirm(`Bạn có chắc chắn muốn ngắt kết nối trang "${page.page_name}"? Dữ liệu sẽ không còn được đồng bộ.`)) return;

    setProcessingId(page.page_id);
    try {
      const token = localStorage.getItem('authToken');
      // Endpoint ngắt kết nối
      const response = await fetch(`${API_BASE_URL}/api/v1/data/facebook-pages/delete_source`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          source_id: page.airbyte_source_id
        }),
      });
      const result = await response.json();
      if (result.code === 200 || result.code === 0) {
        // Reload lại để cập nhật nút về "Connect"
        await fetchAllAccountsAndPages();
      } else {
        alert(result.message || 'Failed to disconnect page');
      }
    } catch (err) {
      alert('Error disconnecting page');
    } finally {
      setProcessingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-all duration-300" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
               <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor">
                  <path d="M22.675 0h-21.35C.582 0 0 .582 0 1.292v21.416C0 23.418.582 24 1.325 24H12.82v-9.29h-3.128v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h5.698c.742 0 1.325-.582 1.325-1.292V1.292C24 .582 23.418 0 22.675 0z"/>
               </svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-800 tracking-tight">Facebook Pages</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Connection Manager</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-all p-2 hover:bg-gray-100 rounded-full active:scale-90">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto min-h-[400px] bg-brand-gray-100/50">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-8 h-8 bg-brand-purple/10 rounded-full"></div>
                </div>
              </div>
              <p className="text-gray-500 font-bold mt-6 animate-pulse text-lg">Đang đồng bộ dữ liệu...</p>
            </div>
          )}

          {status === 'empty' && (
            <div className="text-center py-20 flex flex-col items-center">
              <div className="bg-blue-50 p-10 rounded-[2.5rem] mb-8 shadow-inner border border-blue-100/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.582 0 0 .582 0 1.292v21.416C0 23.418.582 24 1.325 24H12.82v-9.29h-3.128v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h5.698c.742 0 1.325-.582 1.325-1.292V1.292C24 .582 23.418 0 22.675 0z"/></svg>
              </div>
              <p className="text-gray-800 mb-8 max-w-sm mx-auto text-xl font-extrabold leading-tight">Chưa có tài khoản Facebook nào được kết nối.</p>
              <button 
                onClick={handleVerify}
                className="bg-brand-purple hover:bg-purple-700 text-white font-black py-4 px-12 rounded-2xl transition-all shadow-xl shadow-purple-200 active:scale-95 flex items-center space-x-3 group"
              >
                <span>Xác minh tài khoản của bạn</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center py-16">
              <div className="bg-red-50 p-10 rounded-3xl border border-red-100 text-red-700 text-center max-w-md shadow-lg shadow-red-100/50">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <p className="mb-8 font-bold text-xl">{errorMessage}</p>
                <button 
                  onClick={fetchAllAccountsAndPages} 
                  className="bg-red-600 hover:bg-red-700 text-white px-12 py-4 rounded-2xl font-black transition-all active:scale-95 shadow-lg shadow-red-200"
                >
                  Thử lại ngay
                </button>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-12 pb-10">
              {accounts.map(account => {
                const pageList = Object.values(account.pages || {});
                return (
                  <div key={account.provider_id} className="space-y-6">
                    {/* Account Section */}
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                          <h3 className="font-black text-gray-800 text-xl leading-none">{account.provider_name}</h3>
                          <p className="text-xs text-brand-gray-500 font-bold mt-1.5">{account.provider_email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">{pageList.length} Connected Pages</span>
                      </div>
                    </div>

                    {/* Pages Grid */}
                    <div className="grid gap-4">
                      {pageList.length > 0 ? (
                        pageList.map(page => (
                          <div 
                            key={page.page_id} 
                            className={`flex items-center justify-between p-5 bg-white rounded-[2rem] border transition-all duration-500 group relative overflow-hidden ${
                              page.has_airbyte_source 
                                ? 'border-green-400 bg-green-50/5 shadow-xl shadow-green-100/40' 
                                : 'border-gray-100 hover:border-brand-purple hover:shadow-2xl hover:shadow-purple-100/50'
                            }`}
                          >
                            <div className="min-w-0 flex-1 pr-6 relative z-10">
                              <div className="flex items-center space-x-3 mb-2">
                                <p className="font-black text-gray-900 text-lg truncate leading-tight" title={page.page_name}>
                                  {truncate(page.page_name, 35)}
                                </p>
                                {page.has_airbyte_source && (
                                  <span className="bg-green-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-green-200/50 animate-in fade-in slide-in-from-right-2">Active</span>
                                )}
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Page ID</span>
                                <p className="text-[10px] text-brand-gray-600 font-mono bg-gray-100/80 px-2.5 py-1 rounded-lg border border-gray-200/40">{page.page_id}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center relative z-10">
                              {page.has_airbyte_source ? (
                                <button 
                                  onClick={() => handleDisconnectPage(page)}
                                  disabled={processingId === page.page_id}
                                  className="group/btn relative bg-white hover:bg-red-600 text-red-500 hover:text-white text-xs font-black py-3.5 px-8 rounded-2xl transition-all duration-300 shrink-0 border-2 border-red-100 hover:border-red-600 active:scale-95 disabled:opacity-50 flex items-center shadow-sm"
                                >
                                  {processingId === page.page_id ? (
                                    <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                  )}
                                  Disconnect
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleConnectPage(page)}
                                  disabled={processingId === page.page_id}
                                  className="relative bg-brand-purple hover:bg-purple-700 text-white text-xs font-black py-4 px-8 rounded-2xl transition-all duration-300 shrink-0 shadow-xl shadow-purple-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center group/conn"
                                >
                                  {processingId === page.page_id ? (
                                    <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 group-hover/conn:rotate-90 transition-transform" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                  )}
                                  Connect to page
                                </button>
                              )}
                            </div>

                            {/* Decorative element for connected pages */}
                            {page.has_airbyte_source && (
                              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 -mr-16 -mt-16 rounded-full blur-2xl"></div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 bg-white/40 border-2 border-dashed border-gray-200 rounded-[2rem]">
                          <p className="text-gray-400 text-sm font-bold italic">Không tìm thấy trang nào khả dụng cho tài khoản này.</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-100 flex justify-end bg-gray-50/90 backdrop-blur-md">
          <button 
            onClick={onClose} 
            className="px-12 py-3.5 text-brand-gray-500 font-black hover:text-gray-900 transition-all uppercase tracking-widest text-xs hover:bg-white rounded-2xl active:scale-95 shadow-sm"
          >
            Đóng bảng quản lý
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacebookPagesModal;