import React from 'react';

const VoiceWaveform: React.FC = () => {
  return (
    <div className="flex items-center justify-center space-x-1 h-8">
      <div className="w-1 bg-white/80 rounded-full animate-wave [animation-delay:-0.4s]" style={{ height: '20%' }}></div>
      <div className="w-1 bg-white/80 rounded-full animate-wave [animation-delay:-0.2s]" style={{ height: '50%' }}></div>
      <div className="w-1 bg-white/80 rounded-full animate-wave" style={{ height: '80%' }}></div>
      <div className="w-1 bg-white/80 rounded-full animate-wave [animation-delay:-0.2s]" style={{ height: '50%' }}></div>
      <div className="w-1 bg-white/80 rounded-full animate-wave [animation-delay:-0.4s]" style={{ height: '20%' }}></div>
    </div>
  );
};

export default VoiceWaveform;
