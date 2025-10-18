import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Trash2, Check } from 'lucide-react';
import { shoppingListAPI } from '../services/api';

const ShoppingList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await shoppingListAPI.getItems();
      setItems(response.data);
    } catch (error) {
      console.error('Error loading shopping list:', error);
      setError('Failed to load shopping list');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    try {
      const response = await shoppingListAPI.addItem({
        name: newItem.trim(),
        completed: false
      });
      setItems([...items, response.data]);
      setNewItem('');
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item to shopping list');
    }
  };

  const handleToggleItem = async (itemId, completed) => {
    try {
      await shoppingListAPI.updateItem(itemId, { completed });
      setItems(items.map(item => 
        item.id === itemId ? { ...item, completed } : item
      ));
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item');
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to remove this item?')) {
      return;
    }

    try {
      await shoppingListAPI.removeItem(itemId);
      setItems(items.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item');
    }
  };

  const completedItems = items.filter(item => item.completed);
  const pendingItems = items.filter(item => !item.completed);

  if (loading) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <ShoppingCart size={32} />
          <p style={{ marginTop: '1rem' }}>Loading shopping list...</p>
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

  return (
    <div>
      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Shopping List</h2>
        
        {/* Add new item form */}
        <form onSubmit={handleAddItem} style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="input"
              placeholder="Add new item..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              style={{ flex: 1, marginBottom: 0 }}
            />
            <button type="submit" className="button" disabled={!newItem.trim()}>
              <Plus size={16} />
            </button>
          </div>
        </form>

        {/* Pending items */}
        {pendingItems.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: '#666' }}>
              To Buy ({pendingItems.length})
            </h3>
            {pendingItems.map((item) => (
              <div key={item.id} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={(e) => handleToggleItem(item.id, e.target.checked)}
                />
                <span style={{ flex: 1 }}>{item.name}</span>
                <button
                  className="button danger"
                  onClick={() => handleRemoveItem(item.id)}
                  style={{ 
                    padding: '0.25rem 0.5rem', 
                    fontSize: '0.75rem',
                    minWidth: 'auto'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Completed items */}
        {completedItems.length > 0 && (
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: '#666' }}>
              Completed ({completedItems.length})
            </h3>
            {completedItems.map((item) => (
              <div key={item.id} className="checkbox-item" style={{ opacity: 0.6 }}>
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={(e) => handleToggleItem(item.id, e.target.checked)}
                />
                <span style={{ flex: 1, textDecoration: 'line-through' }}>{item.name}</span>
                <button
                  className="button danger"
                  onClick={() => handleRemoveItem(item.id)}
                  style={{ 
                    padding: '0.25rem 0.5rem', 
                    fontSize: '0.75rem',
                    minWidth: 'auto'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {items.length === 0 && (
          <div className="empty-state">
            <ShoppingCart size={64} />
            <h3>Your shopping list is empty</h3>
            <p>Add items you need to buy!</p>
          </div>
        )}
      </div>

      {/* Quick actions */}
      {items.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button 
              className="button secondary"
              onClick={() => {
                if (window.confirm('Clear all completed items?')) {
                  const pendingIds = pendingItems.map(item => item.id);
                  setItems(items.filter(item => pendingIds.includes(item.id)));
                }
              }}
              disabled={completedItems.length === 0}
            >
              Clear Completed
            </button>
            <button 
              className="button secondary"
              onClick={() => {
                if (window.confirm('Clear all items?')) {
                  setItems([]);
                }
              }}
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingList;
