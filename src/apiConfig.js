// apiConfig.js
export const API_BASE_URL = 'https://api.cleancloud.cloud';

export const buildApiUrl = (path) => `${API_BASE_URL}${path}`;
