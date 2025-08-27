import React, { useState } from 'react';
import { auth } from '../firebase';
// FIX: Switched to firebase v8 compat imports to resolve module export errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

interface Props {
  // FIX: Use User type from the firebase namespace.
  user: firebase.User | null;
}

const Header: React.FC<Props> = ({ user }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignIn = async () => {
    // FIX: Instantiate GoogleAuthProvider from the firebase.auth namespace.
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      // FIX: Use the v8-style signInWithPopup method from the auth service.
      await auth.signInWithPopup(provider);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  const handleSignOut = async () => {
    try {
      // FIX: Use the v8-style signOut method from the auth service.
      await auth.signOut();
      setMenuOpen(false);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-10">
      <div className="max-w-4xl mx-auto mt-4 px-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg">
          <div className="flex items-center justify-between p-4 text-white">
            <div className="flex items-center space-x-3">
              {/* Placeholder for Logo */}
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/80" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4 10a6 6 0 1112 0 6 6 0 01-12 0z" clipRule="evenodd" />
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold tracking-wider">NovaTalk</h1>
            </div>

            <div className="relative">
              {user ? (
                <div className="flex items-center space-x-4">
                  <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-full transition-opacity duration-200 hover:opacity-80">
                    <img src={user.photoURL || undefined} alt={user.displayName || 'User Avatar'} className="w-8 h-8 rounded-full" />
                  </button>
                  {menuOpen && (
                    <div className="absolute top-12 right-0 bg-black/30 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl py-2 w-40">
                      <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10">
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
                >
                  Sign in with Google
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;