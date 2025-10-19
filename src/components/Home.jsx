import React, { useState } from 'react';
import { Refrigerator, LogOut } from 'lucide-react';
import { useAuth } from './AuthContext';
import BottomNav from './BottomNav';
import MyFridge from './MyFridge';
import AddItem from './AddItem';

function Home() {
  const { currentUser, signout } = useAuth();
  const [activeView, setActiveView] = useState('fridge');

  const renderActiveView = () => {
    const refreshFridge = () => setActiveView('fridge');

    switch (activeView) {
      case 'fridge':
        return <MyFridge />;
      case 'home':
        return <div className="card"><p>Home Dashboard Coming Soon!</p></div>;
      case 'add':
        return <AddItem onItemAdded={refreshFridge} />;
      default:
        return <MyFridge />;
    }
  };

  return (
    // The "app" class ensures the header, main, and nav layout works correctly
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <Refrigerator />
            <h1>My Fridge</h1>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span>{currentUser?.displayName}</span>
            </div>
            <button className="logout-btn" onClick={signout} aria-label="Log Out">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>
      <main className="main-content">{renderActiveView()}</main>
      <BottomNav activeTab={activeView} onTabChange={setActiveView} />
    </div>
  );
}

export default Home;