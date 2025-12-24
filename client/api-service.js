// ============================================
// API Service for Todo App
// ============================================


// Automatically detect API URL based on environment
// In production (Render), use the same origin as the frontend
// In development (localhost), use localhost:5000
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api'
  : `${window.location.origin}/api`;


class ApiService {
  // Helper method for making HTTP requests
  async request(endpoint, options = {}) {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          // Add Authorization header if token exists
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      });


      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // If 401, redirect to login page
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = 'auth.html';
        }
        
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }


      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }


  // ============================================
  // AUTHENTICATION METHODS
  // ============================================
  
  // Register new user
  async register(name, email, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }


  // Login user
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }


  // Get current user profile
  async getCurrentUser() {
    return this.request('/auth/me');
  }


  // Logout (client-side)
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'auth.html';
  }


  // ============================================
  // TASK METHODS
  // ============================================


  // Fetch all tasks
  async fetchTasks() {
    return this.request('/tasks');
  }


  // Create a new task
  async createTask(taskData) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }


  // Update an existing task
  async updateTask(id, taskData) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }


  // Delete a task
  async deleteTask(id) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }


  // Reorder tasks (for drag and drop)
  async reorderTasks(tasks) {
    return this.request('/tasks/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ tasks }),
    });
  }


  // Health check
  async checkHealth() {
    return this.request('/health');
  }
}


// Export a singleton instance
const apiService = new ApiService();



