
import React, { useState } from 'react';
import type { ConnectorConnection, ApiResponse, ConnectorJobsResponseData, ConnectorJob } from '../types';

interface ConnectorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectorName: string;
  connections: ConnectorConnection[];
  onAddNew: () => void;
}

const API_BASE_URL = 'http://34.56.232.30:8200';

const formatDuration = (pt: string) => {
  if (!pt) return '-';
  const matches = pt.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(\.\d+)?)S)?/);
  if (!matches) return pt;
  const h = matches[1] ? `${matches[1]}h ` : '';
  const m = matches[2] ? `${matches[2]}m ` : '';
  const s = matches[3] ? `${parseFloat(matches[3]).toFixed(0)}s` : '';
  return (h + m + s).trim() || '0s';
};

const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const ConnectorDetailsModal: React.FC<ConnectorDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  connectorName, 
  connections,
  onAddNew
}) => {
  const [expandedConnectionId, setExpandedConnectionId] = useState<string | null>(null);
  const [jobsData, setJobsData] = useState<Record<string, ConnectorJob[]>>({});
  const [loadingJobs, setLoadingJobs] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const fetchJobs = async (connectionId: string) => {
    if (jobsData[connectionId]) return; // Already fetched

    setLoadingJobs(prev => ({ ...prev, [connectionId]: true }));
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No auth token found');

      const response = await fetch(`${API_BASE_URL}/api/v1/app/connectors/${connectionId}/jobs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result: ApiResponse<ConnectorJobsResponseData> = await response.json();

      if (response.ok && result.code === 0 && result.data?.jobs) {
        setJobsData(prev => ({ ...prev, [connectionId]: result.data!.jobs }));
      } else {
        console.error('Failed to fetch jobs:', result.message);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoadingJobs(prev => ({ ...prev, [connectionId]: false }));
    }
  };

  const toggleExpand = (connectionId: string) => {
    if (expandedConnectionId === connectionId) {
      setExpandedConnectionId(null);
    } else {
      setExpandedConnectionId(connectionId);
      fetchJobs(connectionId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center transition-opacity duration-300" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl m-4 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800">{connectorName} Connections</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto mb-6 flex-grow pr-2">
          {connections.length > 0 ? (
            connections.map((conn) => {
              const isExpanded = expandedConnectionId === conn.id;
              const jobs = jobsData[conn.id] || [];
              const isLoading = loadingJobs[conn.id];

              return (
                <div key={conn.id} className="border border-brand-gray-200 rounded-lg bg-brand-gray-100 overflow-hidden">
                  <div 
                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-white transition-colors"
                    onClick={() => toggleExpand(conn.id)}
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {conn.name}
                      </p>
                      <p className="text-xs text-brand-gray-500 font-mono mt-1">ID: {conn.id}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Active
                        </span>
                        {isExpanded ? (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                        ) : (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                        )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="bg-white border-t border-brand-gray-200 p-4">
                      <h4 className="text-sm font-bold text-gray-700 mb-3">Sync History</h4>
                      {isLoading ? (
                         <div className="flex justify-center py-4">
                            <svg className="animate-spin h-6 w-6 text-brand-purple" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                         </div>
                      ) : jobs.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-xs text-left text-gray-500">
                                <thead className="bg-gray-50 text-gray-700 uppercase">
                                    <tr>
                                        <th className="px-3 py-2">Status</th>
                                        <th className="px-3 py-2">Rows</th>
                                        <th className="px-3 py-2">Size</th>
                                        <th className="px-3 py-2">Duration</th>
                                        <th className="px-3 py-2">Started</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {jobs.map((job) => (
                                        <tr key={job.job_id} className="border-b hover:bg-gray-50">
                                            <td className="px-3 py-2">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                    job.status === 'succeeded' ? 'bg-green-100 text-green-800' :
                                                    job.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                    job.status === 'running' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {job.status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 font-medium">{job.rows_synced.toLocaleString()}</td>
                                            <td className="px-3 py-2">{formatBytes(job.bytes_synced)}</td>
                                            <td className="px-3 py-2">{formatDuration(job.duration)}</td>
                                            <td className="px-3 py-2 whitespace-nowrap">
                                                {new Date(job.start_time).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 text-center py-2">No jobs found for this connection.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
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
