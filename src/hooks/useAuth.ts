import { useState, useEffect } from 'react';
// FIX: Switched to firebase v8 compat imports to resolve module export errors.
import firebase from 'firebase/compat/app';
import { auth } from '../firebase';

export function useAuth() {
  // FIX: Use User type from the firebase namespace.
  const [user, setUser] = useState<firebase.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // FIX: Use the v8-style onAuthStateChanged method on the auth service instance.
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { user, loading };
}
