// Food type icons and colors
export const FOOD_TYPES = {
  vegetable: {
    icon: 'Leaf',
    color: '#d4edda',
    textColor: '#155724'
  },
  fruit: {
    icon: 'Apple',
    color: '#fff3cd',
    textColor: '#856404'
  },
  protein: {
    icon: 'Egg',
    color: '#f8d7da',
    textColor: '#721c24'
  },
  dairy: {
    icon: 'Milk',
    color: '#d1ecf1',
    textColor: '#0c5460'
  },
  other: {
    icon: 'Package',
    color: '#e2e3e5',
    textColor: '#383d41'
  }
};

// Expiry status thresholds
export const EXPIRY_THRESHOLDS = {
  URGENT: 3, // days
  WARNING: 7, // days
};

// API endpoints
export const API_ENDPOINTS = {
  FRIDGE: '/fridge',
  SHOPPING_LIST: '/shopping-list',
  BARCODE: '/barcode',
  UPLOAD: '/upload',
  MEAL_PREP: '/meal-prep'
};
