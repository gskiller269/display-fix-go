/**
 * Centralized API configuration for Display Fix Go frontend.
 * Update BASE_URL here to change the backend endpoint across the entire app.
 */

// export const BASE_URL = 'https://backend.displayfixgo.in';
// export const BASE_URL = 'https://gnnww711-5000.inc1.devtunnels.ms';
export const BASE_URL = 'http://localhost:5000';
export const API_URL = `${BASE_URL}/api`;
export const GOOGLE_MAPS_API_KEY = 'AIzaSyDEIiMqiW0EoUBKN02N_Kynpzp5E_hKepw';

export const MSG91_WIDGET_ID = '36667466546a343836333031';
export const MSG91_TOKEN_AUTH = '539678T3vEyHSoo6a363791P1';

/**
 * Resolve a backend asset path to a full URL.
 * Handles paths that are already absolute (http/https) or relative (/uploads/...).
 *
 * @example
 * resolveAsset('/uploads/img.jpg')  // => 'https://backend.displayfixgo.in/uploads/img.jpg'
 * resolveAsset('https://cdn.com/img.jpg')  // => 'https://cdn.com/img.jpg'
 */
export const resolveAsset = (path: string | null | undefined): string | null => {
  if (!path) return null;
  return path.startsWith('http') ? path : `${BASE_URL}${path}`;
};

/**
 * Build a full API endpoint URL from a path relative to /api.
 *
 * @example
 * apiUrl('/repairs/1')  // => 'https://backend.displayfixgo.in/api/repairs/1'
 */
export const apiUrl = (path: string): string => {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${normalized}`;
};

export default API_URL;
