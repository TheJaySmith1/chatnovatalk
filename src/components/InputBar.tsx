import React, { useState, useEffect, useRef } from 'react';
import VoiceWaveform from './VoiceWaveform';

interface Props {
  onSendMessage: (message: string) => void;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  transcript: string;
  onStartCall: () => void;
}

const InputBar: React.FC<Props> = ({ onSendMessage, isListening, startListening, stopListening, transcript, onStartCall }) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setInput(transcript);
  }, [transcript]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      const scrollHeight = inputRef.current.scrollHeight;
      inputRef.current.style.height = `${scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
      if(isListening) stopListening();
    }
  };

  const toggleListening = () => {
    if (isListening) {
        stopListening();
        if(input.trim()) handleSubmit();
    } else {
        startListening();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <footer className="w-full z-10 sticky bottom-0">
        <div className="max-w-3xl mx-auto px-4 pb-4">
            <div className="bg-[#303032]/70 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-2 flex items-end space-x-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isListening ? 'Listening...' : 'Message NovaTalk...'}
                  className="flex-1 bg-transparent text-gray-200 placeholder-gray-500 resize-none outline-none p-2 max-h-40"
                  rows={1}
                  aria-label="Chat input"
                />
                {isListening && <div className="p-2"><VoiceWaveform /></div>}
                
                <button
                    onClick={onStartCall}
                    className="p-2 rounded-full text-gray-400 hover:bg-gray-700/50 transition-colors duration-200"
                    aria-label="Start voice call"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                </button>

                <button
                    onClick={toggleListening}
                    className={`p-2 rounded-full transition-colors duration-200 text-gray-400 ${isListening ? 'bg-red-500/80 !text-white' : 'hover:bg-gray-700/50'}`}
                    aria-label={isListening ? 'Stop listening' : 'Start listening'}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                </button>
                <button
                    onClick={() => handleSubmit()}
                    disabled={!input.trim()}
                    className="p-2 bg-blue-600 rounded-full text-white disabled:bg-gray-700 disabled:text-gray-400 transition-colors duration-200"
                    aria-label="Send message"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7" />
                   </svg>
                </button>
            </div>
        </div>
    </footer>
  );
};

export default InputBar;
