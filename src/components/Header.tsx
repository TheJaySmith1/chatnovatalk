import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-10">
      <div className="max-w-4xl mx-auto mt-4 px-4">
        <div className="bg-black/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg">
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
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;