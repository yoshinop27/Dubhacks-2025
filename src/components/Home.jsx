import React, { useState, useEffect } from 'react';
import { Plus, Refrigerator, ShoppingCart, Clock, AlertTriangle } from 'lucide-react';
import { fridgeAPI } from '../services/api';
import { useAuth } from './AuthContext';
import BottomNav from './BottomNav';
import MyFridge from './MyFridge';
import AddItem from './AddItem';
import ShoppingList from './ShoppingList';

const Home = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [stats, setStats] = useState({
    total: 0,
    expiringSoon: 0,
    expired: 0
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderCurrentPage = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="home-container">
            {/* Welcome Section */}
            <div className="welcome-section">
              <h1>Welcome back, {currentUser?.displayName || 'User'}! 👋</h1>
              <p>Let's keep your fridge organized and reduce food waste</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon total">
                  <Refrigerator size={24} />
                </div>
                <div className="stat-content">
                  <h3>{stats.total}</h3>
                  <p>Total Items</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon warning">
                  <AlertTriangle size={24} />
                </div>
                <div className="stat-content">
                  <h3>{stats.expiringSoon}</h3>
                  <p>Expiring Soon</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon danger">
                  <Clock size={24} />
                </div>
                <div className="stat-content">
                  <h3>{stats.expired}</h3>
                  <p>Expired</p>
                </div>
              </div>
            </div>

            {/* Recent Items */}
            <div className="recent-items">
              <div className="section-header">
                <h2>Recent Items</h2>
                <button 
                  className="view-all-btn"
                  onClick={() => handleTabChange('fridge')}
                >
                  View All
                </button>
              </div>
              
              {loading ? (
                <div className="loading-state">
                  <Clock className="animate-spin" size={32} />
                  <p>Loading your fridge...</p>
                </div>
              ) : recentItems.length > 0 ? (
                <div className="items-list">
                  {recentItems.map((item) => {
                    const expiryStatus = calculateExpiryStatus(item.expiration_date);
                    return (
                      <div key={item.id} className="item-preview">
                        <div className="item-icon">
                          {getItemIcon(item.type)}
                        </div>
                        <div className="item-info">
                          <h4>{item.name}</h4>
                          <p className="item-type">{item.type}</p>
                        </div>
                        <div className={`expiry-badge ${expiryStatus.urgent ? 'urgent' : ''}`}>
                          {expiryStatus.text}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <Refrigerator size={48} />
                  <h3>Your fridge is empty</h3>
                  <p>Add some items to get started!</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="actions-grid">
                <button 
                  className="action-card"
                  onClick={() => handleTabChange('add')}
                >
                  <div className="action-icon">
                    <Plus size={24} />
                  </div>
                  <h3>Add Item</h3>
                  <p>Add items to your fridge</p>
                </button>
                
                <button 
                  className="action-card"
                  onClick={() => handleTabChange('fridge')}
                >
                  <div className="action-icon">
                    <Refrigerator size={24} />
                  </div>
                  <h3>My Fridge</h3>
                  <p>View all your items</p>
                </button>
                
                <button 
                  className="action-card"
                  onClick={() => handleTabChange('shopping')}
                >
                  <div className="action-icon">
                    <ShoppingCart size={24} />
                  </div>
                  <h3>Shopping List</h3>
                  <p>Manage your grocery list</p>
                </button>
              </div>
            </div>
          </div>
        );
      case 'add':
        return <AddItem onItemAdded={loadItems} />;
      case 'fridge':
        return <MyFridge />;
      case 'shopping':
        return <ShoppingList />;
      default:
        return null;
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      if (!currentUser) return;
      
      const response = await fridgeAPI.getItems(currentUser.uid);
      const fridgeItems = response.data.items || [];
      setItems(fridgeItems);
      
      // Calculate stats
      const today = new Date();
      const expiringSoon = fridgeItems.filter(item => {
        if (!item.expiration_date) return false;
        const expiry = new Date(item.expiration_date);
        const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        return diffDays <= 3 && diffDays >= 0;
      });
      
      const expired = fridgeItems.filter(item => {
        if (!item.expiration_date) return false;
        const expiry = new Date(item.expiration_date);
        const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        return diffDays < 0;
      });

      setStats({
        total: fridgeItems.length,
        expiringSoon: expiringSoon.length,
        expired: expired.length
      });
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const getItemIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'vegetable':
        return '🥬';
      case 'fruit':
        return '🍎';
      case 'protein':
        return '🥚';
      case 'dairy':
        return '🥛';
      default:
        return '📦';
    }
  };

  const calculateExpiryStatus = (expiryDate) => {
    if (!expiryDate) return { text: 'No expiry', urgent: false, expired: false };
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: 'Expired', urgent: true, expired: true };
    } else if (diffDays === 0) {
      return { text: 'Today', urgent: true, expired: false };
    } else if (diffDays <= 3) {
      return { text: `${diffDays}d`, urgent: true, expired: false };
    } else {
      return { text: `${diffDays}d`, urgent: false, expired: false };
    }
  };

  const recentItems = items.slice(0, 5);

  return (
    <div className="app">
      <main className="main-content">
        {renderCurrentPage()}
      </main>
      
      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default Home;