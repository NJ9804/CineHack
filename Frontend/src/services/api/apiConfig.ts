// API Configuration and Switcher
import { apiClient as mockApiClient } from './index';
import { apiClient as realApiClient } from './realApi';

// Configuration - set this to true to use the actual backend
const USE_REAL_API = true; // Set to true when backend is running

// Export the appropriate API client based on configuration
export const apiClient = USE_REAL_API ? realApiClient : mockApiClient;

// Also export the toggle function for development
export const toggleApiMode = () => {
  console.log(`Current API mode: ${USE_REAL_API ? 'Real Backend' : 'Mock Data'}`);
  console.log('To use real backend, set USE_REAL_API to true in apiConfig.ts');
};

// Export APIs based on current mode
export * from './index'; // Always export mock APIs for fallback