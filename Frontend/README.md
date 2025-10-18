# Digital Fridge Frontend Components

This folder contains the React components for the Digital Fridge application. These components are designed to integrate with your existing React app structure.

## Components Overview

### Core Components
- **App.jsx** - Main application component with navigation
- **Header.jsx** - App header with branding
- **BottomNav.jsx** - Bottom navigation bar

### Feature Components
- **AddItem.jsx** - Add items via barcode scan, manual input, or image upload
- **MyFridge.jsx** - Display fridge items with expiry tracking
- **ShoppingList.jsx** - Shopping list with checkbox functionality

### Services & Utils
- **services/api.js** - API integration layer for Flask backend
- **utils/constants.js** - App constants and configuration
- **utils/helpers.js** - Utility functions for date handling, validation, etc.

## Integration Instructions

### 1. Copy Components to Your React App

Copy the components from this Frontend folder to your existing React app:

```bash
# Copy components to your existing src directory
cp -r Frontend/src/components/* Dubhacks-2025/src/components/
cp -r Frontend/src/services/* Dubhacks-2025/src/services/
cp -r Frontend/src/utils/* Dubhacks-2025/src/utils/
```

### 2. Update Your Main App

Replace your existing `Dubhacks-2025/src/App.jsx` with the content from `Frontend/src/App.jsx`.

### 3. Add Dependencies

Make sure you have the required dependencies in your `package.json`:

```bash
npm install axios lucide-react
```

### 4. Update Styling

Add the CSS from `Frontend/src/App.css` to your existing CSS files or create a new CSS file.

## API Integration

The components expect your Flask backend to provide these endpoints:

### Fridge Management
- `GET /api/fridge/items` - Get all fridge items
- `POST /api/fridge/items` - Add new item
- `PUT /api/fridge/items/:id` - Update item
- `DELETE /api/fridge/items/:id` - Remove item

### Barcode Scanning
- `POST /api/barcode/scan` - Scan barcode and get product info

### Shopping List
- `GET /api/shopping-list` - Get shopping list
- `POST /api/shopping-list` - Add item to list
- `PUT /api/shopping-list/:id` - Update item
- `DELETE /api/shopping-list/:id` - Remove item

### File Upload
- `POST /api/upload/parse-food` - Upload image/video for food parsing

### Meal Prep
- `GET /api/meal-prep/recommendations` - Get meal suggestions
- `POST /api/meal-prep/suggestions` - Get suggestions for specific items

## Features

### Add Item Functionality
- **Barcode Scanner**: Placeholder for real barcode scanning integration
- **Manual Input**: Form with food type selection and expiry date
- **Image/Video Upload**: Drag & drop interface for food parsing

### Fridge Management
- Visual food type icons (leaf, egg, milk, apple)
- Smart expiry countdown with color coding
- Remove items functionality
- Empty state handling

### Shopping List
- Add new items with text input
- Checkbox functionality for completed items
- Separate sections for pending/completed items
- Quick action buttons

## Styling

The components use modern CSS with:
- Gradient header background
- Card-based layout
- Responsive design for mobile
- Color-coded expiry status
- Smooth transitions and hover effects

## Development Notes

### Barcode Scanner Integration
To integrate a real barcode scanner, install a library like `react-qr-scanner` and replace the placeholder in `AddItem.jsx`.

### File Upload
The upload component supports drag & drop, file type validation, and size limits.

### Error Handling
All components include comprehensive error handling with user-friendly messages and loading states.

## Usage

Once integrated, your app will have:
1. A header with app branding
2. Bottom navigation with 3 tabs
3. Add Item functionality with multiple input methods
4. Fridge view showing all items with expiry tracking
5. Shopping list with checkbox functionality

The components are designed to work seamlessly with your Flask backend and AWS services for a complete digital fridge experience!
