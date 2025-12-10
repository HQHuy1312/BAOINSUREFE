
import React from 'react';

export interface NavItemType {
  id: string;
  label: string;
  icon: React.ReactElement;
  badge?: string;
  active?: boolean;
  isHeader?: boolean;
  children?: NavItemType[];
}

export interface ConnectorType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactElement;
  addon?: boolean;
  implemented?: boolean;
}

export interface CategoryType {
  id: string;
  title: string;
  connectors: ConnectorType[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T | null;
}

// New interface for individual connection details from API
export interface ConnectorConnection {
  name: string;
  id: string;
}

export interface ConnectorStatus {
  name:string;
  connected: boolean;
}

// Updated response structure based on new API
export interface ConnectorStatusResponseData {
  connectors: ConnectorConnection[];
}

export interface GoogleSheetInfo {
  sheet_name: string;
  document_id: string;
}

export interface Spreadsheet {
  name: string;
  id: string;
}

export interface ConfiguredSheetsData {
  spreadsheets: Spreadsheet[];
}

export interface SheetDetail {
  spreadsheet_id: string;
  sheet_name: string;
  user_id: number;
  data: any[][];
}

export interface SpreadsheetDetailsData {
  spreadsheet_id: string;
  sheets: SheetDetail[];
}

export interface FacebookPage {
  id: string;
  name: string;
  url?: string;
  is_active?: boolean;
  access_token?: string;
}

export type FacebookMetric = {
  name: string;
  period: string;
  values: { value: any; end_time: string }[];
  title: string | null;
  description: string;
  id: string;
};

export interface FacebookPageDetailsData {
  [pageId: string]: FacebookMetric[];
}

export interface FacebookAccount {
  user_id: number;
  provider_user_id: string;
  access_token: string;
  is_active: boolean;
  source: string;
}

export type FacebookAccountsData = FacebookAccount[];

export interface FacebookPageWithDetails extends FacebookPage {
  page_id: string;
  access_token: string;
  is_active: boolean;
  name: string;
}

export interface FacebookPagesByAccountData {
    [pageId: string]: FacebookPageWithDetails;
}

export interface ConnectorJob {
  connection_id: string;
  job_id: number;
  job_type: string;
  start_time: string;
  status: string;
  bytes_synced: number;
  duration: string;
  last_updated_at: string;
  rows_synced: number;
}

export interface ConnectorJobsResponseData {
  jobs: ConnectorJob[];
}
