import React, { useState } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import AddItem from './components/AddItem';
import MyFridge from './components/MyFridge';
import ShoppingList from './components/ShoppingList';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('fridge');

  const renderContent = () => {
    switch (activeTab) {
      case 'add':
        return <AddItem />;
      case 'fridge':
        return <MyFridge />;
      case 'shopping':
        return <ShoppingList />;
      default:
        return <MyFridge />;
    }
  };

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        {renderContent()}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
