import axios from 'axios';
//import { auth } from './firebase';

const API_BASE_URL = '/api'; // Use relative path for Vite proxy

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fridge items API
export const fridgeAPI = {
  // Get all items in fridge
  getItems: (userId) => api.get(`/items/${userId}`),

  // Add new item to fridge
  addItem: (userId, itemData) => api.post(`/items/${userId}`, itemData),

  // Remove item from fridge
  removeItem: (userId, itemId) => api.delete(`/items/${userId}/${itemId}`),

  // Update item expiry
  updateItem: (userId, itemId, data) => api.put(`/items/${userId}/${itemId}`, data),
};

// User API
export const userAPI = {
  initialize: (userId) => api.post('/fridge/init', { user_id: userId }),
};

// Barcode scanning API
export const barcodeAPI = {
  // Scan barcode and get product info
  scanBarcode: (barcode) => api.get(`/getfood?barcode=${barcode}`),

  // Search manually
  search: (query) => api.get(`/getfood?search=${query}`)
};

// Shopping list API
export const shoppingListAPI = {
  // Get shopping list
  getItems: () => api.get('/shopping-list'),

  // Add item to shopping list
  addItem: (itemData) => api.post('/shopping-list', itemData),

  // Update item (check/uncheck)
  updateItem: (itemId, data) => api.put(`/shopping-list/${itemId}`, data),

  // Remove item from shopping list
  removeItem: (itemId) => api.delete(`/shopping-list/${itemId}`),
};

// Image/Video upload API
export const uploadAPI = {
  // Upload image/video for food parsing
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/parse-food', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Meal prep recommendations API
export const mealPrepAPI = {
  // Get meal suggestions based on fridge contents
  getMealSuggestion: (userId) => api.get(`/meal-suggestion/${userId}`),

  // Get specific meal suggestions for items
  getSuggestionsForItems: (itemIds) => api.post('/meal-prep/suggestions', { itemIds }),
};

export default api;
