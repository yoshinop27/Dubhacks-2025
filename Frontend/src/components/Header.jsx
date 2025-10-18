import React from 'react';
import { Refrigerator } from 'lucide-react';

const Header = () => {
  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        <Refrigerator size={28} />
        <h1>Digital Fridge</h1>
      </div>
    </header>
  );
};

export default Header;
