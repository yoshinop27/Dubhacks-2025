import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { userAPI } from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signinWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
  };

  const signout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if this is a new user
        const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;
        if (isNewUser) {
          try {
            await userAPI.initialize(user.uid);
            console.log('New user initialized in backend.');
          } catch (error) {
            console.error('Failed to initialize new user:', error);
          }
        }
      }
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = { currentUser, signinWithGoogle, signout };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}