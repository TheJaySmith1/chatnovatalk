import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-10">
      <div className="max-w-3xl mx-auto mt-4 px-4">
        <div className="bg-gray-900/40 backdrop-blur-xl rounded-xl border border-white/10 shadow-md">
          <div className="flex items-center justify-between p-3 text-white">
            <div className="flex items-center space-x-3">
              {/* Abstract Logo */}
              <div className="w-8 h-8 bg-gray-500/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
                  <path d="M12 7V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 className="text-lg font-semibold tracking-wide">NovaTalk</h1>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
