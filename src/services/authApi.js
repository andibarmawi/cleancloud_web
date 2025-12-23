const API_BASE_URL = 'http://localhost:8080';

// Helper untuk menambahkan token ke headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('kosan_owner_token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Login function
export const loginKosanOwner = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/kosan-owner/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Get kosan owner dashboard data dengan auth
export const getKosanOwnerDashboard = async (kosanId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/public/1/kosan/${kosanId}/owner`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      // Token expired atau tidak valid
      localStorage.removeItem('kosan_owner_token');
      localStorage.removeItem('kosan_owner_user');
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching kosan owner data:', error);
    throw error;
  }
};

// Logout function
export const logoutKosanOwner = () => {
  localStorage.removeItem('kosan_owner_token');
  localStorage.removeItem('kosan_owner_user');
  // Optional: Call backend logout API
  // fetch(`${API_BASE_URL}/api/kosan-owner/logout`, { method: 'POST' });
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('kosan_owner_token');
};

// Get current user
export const getCurrentUser = () => {
  const userData = localStorage.getItem('kosan_owner_user');
  return userData ? JSON.parse(userData) : null;
};