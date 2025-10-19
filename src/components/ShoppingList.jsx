import React, { useState } from 'react';
import { BrainCircuit, Loader, Lightbulb } from 'lucide-react';
import { mealPrepAPI } from '../services/api';
import { useAuth } from './AuthContext';

const ShoppingList = () => {
  const { currentUser } = useAuth();
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetSuggestion = async () => {
    if (!currentUser) {
      setError('You must be logged in to get a suggestion.');
      return;
    }
    setLoading(true);
    setError('');
    setSuggestion('');
    try {
      const response = await mealPrepAPI.getMealSuggestion(currentUser.uid);
      setSuggestion(response.data.suggestion);
    } catch (err) {
      console.error('Error getting meal suggestion:', err);
      setError('Could not fetch a meal suggestion. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1rem' }}>Meal Ideas</h2>

      <div className="suggestion-generator">
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          Get a recipe idea based on the items currently in your fridge.
        </p>
        <button className="button" onClick={handleGetSuggestion} disabled={loading}>
          {loading ? (
            <>
              <Loader className="animate-spin" size={20} style={{ marginRight: '0.5rem' }} />
              Generating...
            </>
          ) : (
            <>
              <BrainCircuit size={20} style={{ marginRight: '0.5rem' }} />
              Suggest a Meal
            </>
          )}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {suggestion && (
        <div className="suggestion-result">
          <div className="suggestion-header">
            <Lightbulb size={24} />
            <h3>Here's an Idea!</h3>
          </div>
          {/* Use pre-wrap to respect newlines from the AI's response */}
          <pre className="suggestion-text">
            {suggestion}
          </pre>
        </div>
      )}

      {/* You can add your shopping list functionality below */}
      <div style={{ marginTop: '2rem', textAlign: 'center', color: '#999' }}>
        <p>Shopping list feature coming soon!</p>
      </div>
    </div>
  );
};

export default ShoppingList;
