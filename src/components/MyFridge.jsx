import React, { useState, useEffect, useCallback } from 'react';
import { Leaf, Egg, Milk, Apple, Package, Trash2, Clock } from 'lucide-react';
import { fridgeAPI } from '../services/api';
import { useAuth } from './AuthContext';

const MyFridge = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  const loadItems = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const response = await fridgeAPI.getItems(currentUser.uid);
      // Ensure we are setting the array of items from the response object
      setItems(response.data.items || []);
    } catch (error) {
      console.error('Error loading items:', error);
      setError('Failed to load fridge items. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadItems();
    }
  }, [currentUser, loadItems]);

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to remove this item?')) {
      return;
    }

    try {
      await fridgeAPI.removeItem(currentUser.uid, itemId);
      setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item');
    }
  };

  const getItemIcon = (type = 'other') => {
    const iconProps = { size: 20 };
    switch (type?.toLowerCase()) {
      case 'vegetable':
        return <Leaf {...iconProps} />;
      case 'fruit':
        return <Apple {...iconProps} />;
      case 'protein':
        return <Egg {...iconProps} />;
      case 'dairy':
        return <Milk {...iconProps} />;
      default:
        return <Package {...iconProps} />;
    }
  };

  const getItemIconClass = (type = 'other') => {
    switch (type?.toLowerCase()) {
      case 'vegetable':
        return 'vegetable';
      case 'fruit':
        return 'fruit';
      case 'protein':
        return 'protein';
      case 'dairy':
        return 'dairy';
      default:
        return 'vegetable';
    }
  };

  const calculateExpiryStatus = (expiration_date) => {
    if (!expiration_date) return { text: 'No expiry date', urgent: false };
    
    const today = new Date();
    const expiry = new Date(expiration_date);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: 'Expired', urgent: true };
    } else if (diffDays === 0) {
      return { text: 'Expires today', urgent: true };
    } else if (diffDays <= 3) {
      return { text: `${diffDays} days left`, urgent: true };
    } else if (diffDays <= 7) {
      return { text: `${diffDays} days left`, urgent: false };
    } else {
      const weeks = Math.floor(diffDays / 7);
      const remainingDays = diffDays % 7;
      if (weeks > 0) {
        return { 
          text: `${weeks} week${weeks > 1 ? 's' : ''}${remainingDays > 0 ? ` ${remainingDays} day${remainingDays > 1 ? 's' : ''}` : ''} left`, 
          urgent: false 
        };
      } else {
        return { text: `${diffDays} days left`, urgent: false };
      }
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <Clock className="animate-spin" size={32} />
          <p style={{ marginTop: '1rem' }}>Loading your fridge...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#dc3545' }}>
          <p>{error}</p>
          <button className="button" onClick={loadItems} style={{ marginTop: '1rem' }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <Package size={64} />
          <h3>Your fridge is empty</h3>
          <p>Add some items to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>My Fridge ({items.length} items)</h2>
        
        {items.map((item) => {
          const expiryStatus = calculateExpiryStatus(item.expiration_date);
          return (
            <div key={item.id} className="item-card">
              <div className={`item-icon ${getItemIconClass(item.type)}`}>
                {getItemIcon(item.type)}
              </div>
              
              <div className="item-details">
                <div className="item-name">{item.name}</div>
                <div className="item-type" style={{ 
                  fontSize: '0.875rem', 
                  color: '#666', 
                  textTransform: 'capitalize',
                  marginBottom: '0.25rem'
                }}>
                  {item.type}
                </div>
                <div className={`item-expiry ${expiryStatus.urgent ? 'expiring-soon' : ''}`}>
                  {expiryStatus.text}
                </div>
                {item.quantities && item.quantities > 1 && (
                  <div style={{ fontSize: '0.75rem', color: '#666' }}>
                    Qty: {item.quantities}
                  </div>
                )}
              </div>
              
              <button
                className="button danger"
                onClick={() => handleRemoveItem(item.id)}
                style={{ 
                  padding: '0.5rem', 
                  fontSize: '0.875rem',
                  minWidth: 'auto'
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyFridge;
