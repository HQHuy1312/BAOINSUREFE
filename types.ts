
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

// --- Connector API Types ---

export interface ConnectorSourceConfiguration {
  SOURCE_TYPE: string;
  [key: string]: any;
}

export interface ConnectorSource {
  source_id: string;
  name: string;
  source_type?: string; // Sometimes at root
  configuration: ConnectorSourceConfiguration;
  workspace_id: string;
  created_at: number;
}

export interface ConnectorConnectionData {
  connection_id: string;
  name: string; // Internal name, e.g. tiktok_shop_123
  source_id: string;
  destination_id: string;
  status: string; // e.g., "active"
  created_at: number;
}

export interface ConnectorStatusResponseData {
  connectors: ConnectorConnectionData[];
}

export interface ConnectorSourcesResponseData {
  sources: ConnectorSource[];
}

// UI Representation of a connection
export interface ConnectorConnection {
  id: string; // connection_id
  name: string; // Friendly name from Source
  status: string;
  sourceType: string;
  sourceId: string;
}

// --- End Connector API Types ---

export interface GoogleSheetInfo {
  sheet_name: string;
  document_id: string;
}

export interface Spreadsheet {
  name: string;
  id: string;
  connection_id?: string; // Added to link to connection
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
}

export interface FacebookPageDetails {
  [key: string]: any;
}

export interface FacebookPageDetailsData {
  [pageId: string]: FacebookPageDetails[];
}
