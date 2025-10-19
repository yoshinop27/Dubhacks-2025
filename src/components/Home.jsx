import React from 'react';
import { Refrigerator, LogOut } from 'lucide-react';
import { useAuth } from '../AuthContext';

function Home() {
  const { currentUser, signout } = useAuth();

  return (
    <div className="home-container">
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
      <main className="main-content">
        <p>Welcome to your Digital Fridge!</p>
      </main>
    </div>
  );
}

export default Home;