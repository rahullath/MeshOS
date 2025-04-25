/**
 * API utilities for MeshOS
 */

// Default fetch options
const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// Handle API responses
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  
  // Parse JSON if the response is JSON
  const data = isJson ? await response.json() : await response.text();
  
  // If the response is not ok, throw an error
  if (!response.ok) {
    const error = (data && data.message) || response.statusText;
    throw new Error(error);
  }
  
  return data;
};

// API methods
export const api = {
  // GET request
  get: async (url) => {
    try {
      const response = await fetch(url, {
        ...defaultOptions,
        method: 'GET',
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`GET ${url} failed:`, error);
      throw error;
    }
  },
  
  // POST request
  post: async (url, data) => {
    try {
      const response = await fetch(url, {
        ...defaultOptions,
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`POST ${url} failed:`, error);
      throw error;
    }
  },
  
  // PUT request
  put: async (url, data) => {
    try {
      const response = await fetch(url, {
        ...defaultOptions,
        method: 'PUT',
        body: JSON.stringify(data),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`PUT ${url} failed:`, error);
      throw error;
    }
  },
  
  // DELETE request
  delete: async (url) => {
    try {
      const response = await fetch(url, {
        ...defaultOptions,
        method: 'DELETE',
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`DELETE ${url} failed:`, error);
      throw error;
    }
  }
};
