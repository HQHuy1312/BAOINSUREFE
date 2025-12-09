
import React from 'react';
import type { NavItemType, CategoryType } from './types';
import { 
    GettingStartedIcon, ConnectorsIcon, DailyReportingIcon, LTVRetentionIcon,
    AcquisitionIcon, CreativeStudioIcon, RetentionIcon, IncrementalityTestingIcon,
    PersonasIcon, ProductsIcon, SubscriptionsIcon, EngagementIcon, ActivateIcon, AskBAOAIicon,
    GoogleSheetsIcon, FacebookPagesIcon, TikTokIcon, ShopeeIcon, LazadaIcon,
    GoogleAdsIcon, ZaloIcon, PlugIcon, LiveIcon
} from './components/icons';

export const NAV_ITEMS: NavItemType[] = [
  { id: 'getting-started', label: 'Getting started', icon: <GettingStartedIcon className="w-5 h-5" /> },
  { id: 'connectors', label: 'Connectors', icon: <ConnectorsIcon className="w-5 h-5" />, active: true },
  { id: 'dashboards', label: 'Dashboards', icon: <DailyReportingIcon className="w-5 h-5 opacity-0" />, isHeader: true },
  { id: 'daily-reporting', label: 'Daily Reporting', icon: <DailyReportingIcon className="w-5 h-5" /> },
  { id: 'ltv-retention', label: 'LTV & Retention', icon: <LTVRetentionIcon className="w-5 h-5" /> },
  { id: 'acquisition', label: 'Acquisition', icon: <AcquisitionIcon className="w-5 h-5" /> },
  { id: 'creative-studio', label: 'Creative Studio', icon: <CreativeStudioIcon className="w-5 h-5" /> },
  { id: 'retention', label: 'Retention', icon: <RetentionIcon className="w-5 h-5" /> },
  { id: 'incrementality-testing', label: 'Incrementality Testing', icon: <IncrementalityTestingIcon className="w-5 h-5" /> },
  { id: 'personas', label: 'Personas', icon: <PersonasIcon className="w-5 h-5" />, badge: 'New' },
  { id: 'products', label: 'Products', icon: <ProductsIcon className="w-5 h-5" /> },
  { id: 'subscriptions', label: 'Subscriptions', icon: <SubscriptionsIcon className="w-5 h-5" /> },
  { id: 'engagement', label: 'Engagement', icon: <EngagementIcon className="w-5 h-5" /> },
  { id: 'activate', label: 'Activate', icon: <ActivateIcon className="w-5 h-5" /> },
];

const connectorSort = (a: { implemented?: boolean }, b: { implemented?: boolean }) => {
  const aVal = a.implemented ? 1 : 0;
  const bVal = b.implemented ? 1 : 0;
  return bVal - aVal;
};

export const CONNECTOR_CATEGORIES: CategoryType[] = [
  {
    id: 'communication-advertising',
    title: 'Communication & Advertising',
    connectors: [
      { id: 'facebook-pages', name: 'Facebook Page Organic', description: 'Organic social media insights.', icon: <FacebookPagesIcon className="w-10 h-10 text-blue-600" />, implemented: true },
      { id: 'facebook-ads', name: 'Facebook Ads', description: 'Advertising platform', icon: <FacebookPagesIcon className="w-10 h-10 text-blue-800" />, implemented: false },
      { id: 'facebook-livestream', name: 'Facebook Livestream', description: 'Live video streaming insights', icon: <LiveIcon className="w-10 h-10 text-red-500" />, implemented: false },
      { id: 'facebook-video', name: 'Facebook Video', description: 'Video performance insights', icon: <FacebookPagesIcon className="w-10 h-10 text-blue-700" />, implemented: false },
      { id: 'google-ads', name: 'Google Ads', description: 'Advertising platform', icon: <GoogleAdsIcon className="w-10 h-10" />, implemented: false },
      { id: 'lazada-ads', name: 'Lazada Ads', description: 'Advertising on Lazada', icon: <LazadaIcon className="w-10 h-10" />, implemented: false },
      { id: 'shopee-ads', name: 'Shopee Ads', description: 'Advertising on Shopee', icon: <ShopeeIcon className="w-10 h-10" />, implemented: false },
      { id: 'tiktok-ads', name: 'TikTok Ads', description: 'Advertising on TikTok', icon: <TikTokIcon className="w-10 h-10" />, implemented: false },
      { id: 'tiktok-affiliate-video', name: 'TikTok Affiliate Video', description: 'Affiliate marketing video insights', icon: <TikTokIcon className="w-10 h-10" />, implemented: false },
      { id: 'tiktok-page-organic', name: 'TikTok Page Organic', description: 'Organic TikTok insights', icon: <TikTokIcon className="w-10 h-10" />, implemented: false },
      { id: 'tiktok-livestream', name: 'TikTok Livestream', description: 'Live video streaming insights', icon: <TikTokIcon className="w-10 h-10" />, implemented: false },
      { id: 'cnv-loyalty', name: 'CNV Loyalty (Haravan, Zalo)', description: 'Customer loyalty platform', icon: <PlugIcon className="w-10 h-10 text-purple-500" />, implemented: false },
      { id: 'zalo-oa', name: 'Zalo OA', description: 'Zalo Official Account insights', icon: <ZaloIcon className="w-10 h-10" />, implemented: false },
    ].sort(connectorSort),
  },
  {
    id: 'sales-channels',
    title: 'Sales Channels',
    connectors: [
      { id: 'shopee', name: 'Shopee', description: 'E-commerce platform', icon: <ShopeeIcon className="w-10 h-10" />, implemented: false },
      { id: 'tiktok-shop', name: 'TikTok Shop', description: 'E-commerce platform for TikTok', icon: <TikTokIcon className="w-10 h-10" />, implemented: false },
      { id: 'haravan', name: 'Haravan', description: 'Omni-channel sales solution', icon: <PlugIcon className="w-10 h-10 text-blue-500" />, implemented: false },
      { id: 'lazada', name: 'Lazada', description: 'E-commerce platform', icon: <LazadaIcon className="w-10 h-10" />, implemented: false },
      { id: 'omisell', name: 'Omisell', description: 'Multi-channel sales management', icon: <PlugIcon className="w-10 h-10 text-gray-500" />, implemented: false },
      { id: 'pancake', name: 'Pancake', description: 'Social media sales management', icon: <PlugIcon className="w-10 h-10 text-yellow-500" />, implemented: false },
    ].sort(connectorSort),
  },
  {
    id: 'fulfillment',
    title: 'Fulfillment',
    connectors: [
        { id: 'boxme', name: 'BoxMe', description: 'E-commerce fulfillment service', icon: <PlugIcon className="w-10 h-10 text-green-600" />, implemented: false },
    ].sort(connectorSort)
  },
  {
    id: 'other-datasources',
    title: 'Other Datasources',
    connectors: [
      {
        id: 'google-sheets',
        name: 'Google Sheets',
        description: 'Connect spend, expenses, exchange rates, COGs or any other data.',
        icon: <GoogleSheetsIcon className="w-10 h-10" />,
        implemented: true,
      },
    ].sort(connectorSort),
  }
];

export const TABS = [
  'All',
  'Communication & Advertising',
  'Sales Channels',
  'Fulfillment',
  'Other Datasources',
];