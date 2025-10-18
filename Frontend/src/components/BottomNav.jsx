import React from 'react';
import { Plus, Refrigerator, ShoppingCart } from 'lucide-react';

const BottomNav = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'add', label: 'Add Item', icon: Plus },
    { id: 'fridge', label: 'My Fridge', icon: Refrigerator },
    { id: 'shopping', label: 'Shopping', icon: ShoppingCart },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          className={`nav-button ${activeTab === id ? 'active' : ''}`}
          onClick={() => onTabChange(id)}
        >
          <Icon />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
