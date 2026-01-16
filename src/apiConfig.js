// apiConfig.js
export const API_BASE_URL = 'https://api.cleancloud.cloud';
//export const API_BASE_URL = 'http://localhost:8080';

export const buildApiUrl = (path) => `${API_BASE_URL}${path}`;
