import React from 'react';
import { Home, Plus, Refrigerator, ShoppingCart, CookingPot } from 'lucide-react';

const BottomNav = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'add', label: 'Add', icon: Plus },
    { id: 'fridge', label: 'Fridge', icon: Refrigerator },
    { id: 'shopping', label: 'Meals', icon: CookingPot },
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
