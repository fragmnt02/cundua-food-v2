import { API_URL } from '../config/config';

class ApiClient {
  async fetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: 'include', // This is important for cookie handling
      headers
    });

    if (response.status === 401) {
      // Session expired or unauthorized
      // You might want to trigger a navigation to login screen here
      throw new Error('Authentication required');
    }

    return response;
  }

  async get(endpoint: string, options: Omit<RequestInit, 'method'> = {}) {
    return this.fetch(endpoint, { ...options, method: 'GET' });
  }

  async post(
    endpoint: string,
    data?: any,
    options: Omit<RequestInit, 'method' | 'body'> = {}
  ) {
    return this.fetch(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(
    endpoint: string,
    data?: any,
    options: Omit<RequestInit, 'method' | 'body'> = {}
  ) {
    return this.fetch(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint: string, options: Omit<RequestInit, 'method'> = {}) {
    return this.fetch(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
