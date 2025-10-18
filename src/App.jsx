import React, { useState } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Login from './components/Login';
import Home from './components/Home';
import AddItem from './components/AddItem';
import MyFridge from './components/MyFridge';
import ShoppingList from './components/ShoppingList';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');

  const handleLogin = (userInfo) => {
    setUser(userInfo);
    setActiveTab('home');
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('home');
  };

  const handleNavigate = (tab) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    if (!user) {
      return <Login onLogin={handleLogin} />;
    }

    switch (activeTab) {
      case 'home':
        return <Home user={user} onNavigate={handleNavigate} />;
      case 'add':
        return <AddItem />;
      case 'fridge':
        return <MyFridge />;
      case 'shopping':
        return <ShoppingList />;
      default:
        return <Home user={user} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="app">
      {user && <Header user={user} onLogout={handleLogout} />}
      <main className="main-content">
        {renderContent()}
      </main>
      {user && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}
    </div>
  );
}

export default App;
