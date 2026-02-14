// API utility for handling requests in different environments
const getApiBaseUrl = () => {
  // In production, use the actual backend URL
  // In development, use the proxy
  if (import.meta.env.PROD) {
    // Replace with your actual backend URL when deployed
    return 'YOUR_BACKEND_URL'; // e.g., 'https://your-backend.vercel.app'
  }
  return ''; // Empty string uses relative path which goes through proxy in dev
};

export const api = {
  get: async (endpoint, options = {}) => {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
  
  post: async (endpoint, data, options = {}) => {
    return api.get(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  put: async (endpoint, data, options = {}) => {
    return api.get(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  delete: async (endpoint, options = {}) => {
    return api.get(endpoint, {
      ...options,
      method: 'DELETE',
    });
  },
};

// Authenticated API calls
export const authApi = {
  get: async (endpoint, token, options = {}) => {
    return api.get(endpoint, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
  },
  
  post: async (endpoint, data, token, options = {}) => {
    return authApi.get(endpoint, token, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  put: async (endpoint, data, token, options = {}) => {
    return authApi.get(endpoint, token, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  delete: async (endpoint, token, options = {}) => {
    return authApi.get(endpoint, token, {
      ...options,
      method: 'DELETE',
    });
  },
};