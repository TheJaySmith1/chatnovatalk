import React, { useState, useEffect, useRef } from 'react';
import { Message, Role, UserProfile } from '../types';
import { useVoice } from '../hooks/useVoice';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

interface Props {
  user: UserProfile;
  onEndCall: (history: Message[]) => void;
  getAiResponse: (history: Message[]) => Promise<Message>;
  initialMessages: Message[];
}

type CallStatus = 'initializing' | 'ai_speaking' | 'user_listening' | 'processing' | 'error';

const CallView: React.FC<Props> = ({ user, onEndCall, getAiResponse, initialMessages }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<CallStatus>('initializing');
  const transcriptRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);

  const handleFinalTranscript = async (transcript: string) => {
    if (!transcript.trim()) return;
    
    stopListening();
    setStatus('processing');
    const userMessage: Message = { id: crypto.randomUUID(), role: Role.USER, content: transcript };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    try {
        const aiResponse = await getAiResponse(newMessages);
        if (isMounted.current) {
            setMessages(prev => [...prev, aiResponse]);
            speak(aiResponse.content);
            setStatus('ai_speaking');
        }
    } catch (error) {
        console.error("Error getting AI response in call:", error);
        if (isMounted.current) {
            const errorMessage = "I'm sorry, I encountered an error. Please try again.";
            speak(errorMessage);
            setStatus('ai_speaking'); // Allow user to try again
        }
    }
  };

  const { isListening, startListening, stopListening } = useVoice({ onFinalTranscript: handleFinalTranscript });
  const { speak, cancel } = useTextToSpeech({ onEnd: () => {
    if (isMounted.current) {
        setStatus('user_listening');
    }
  }});

  useEffect(() => {
    isMounted.current = true;
    const greeting = "Hello! Let's talk. What's on your mind?";
    const initialAiMessage: Message = {
        id: crypto.randomUUID(),
        role: Role.ASSISTANT,
        content: greeting,
    };
    // Start with the last 4 messages for context, plus the new greeting
    const contextMessages = initialMessages.slice(-4);
    setMessages([...contextMessages, initialAiMessage]);
    speak(greeting);
    setStatus('ai_speaking');

    return () => {
        isMounted.current = false;
        stopListening();
        cancel();
    }
  }, []);

  useEffect(() => {
    if (status === 'user_listening' && !isListening) {
      startListening();
    }
  }, [status, isListening, startListening]);

  useEffect(() => {
    transcriptRef.current?.scrollTo(0, transcriptRef.current.scrollHeight);
  }, [messages]);

  const handleHangUp = () => {
    stopListening();
    cancel();
    onEndCall(messages);
  };
  
  let statusText = "Connecting...";
  if (status === 'ai_speaking') statusText = "NovaTalk is speaking...";
  if (status === 'user_listening') statusText = "Listening...";
  if (status === 'processing') statusText = "Thinking...";
  if (status === 'error') statusText = "An error occurred.";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-2xl z-50 flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-4xl h-full flex flex-col">
        {/* Transcript Area */}
        <div ref={transcriptRef} className="flex-1 overflow-y-auto p-4 space-y-4 text-center text-lg lg:text-xl text-white/80">
            {messages.slice(-5).map(msg => (
                <p key={msg.id} className={`${msg.role === Role.USER ? 'font-semibold text-white' : ''}`}>
                    {msg.role === Role.USER ? `${user.displayName}: ` : "NovaTalk: "}{msg.content}
                </p>
            ))}
        </div>

        {/* Visualizer and Status */}
        <div className="flex-grow flex flex-col items-center justify-center space-y-6">
            <div className="relative w-48 h-48 lg:w-64 lg:h-64 flex items-center justify-center">
                 <div className={`absolute rounded-full bg-blue-500/30 animate-pulse ${status === 'user_listening' ? 'w-full h-full' : 'w-3/4 h-3/4'}`}></div>
                 <div className={`absolute rounded-full bg-blue-500/50 animate-pulse [animation-delay:-0.5s] ${status === 'ai_speaking' ? 'w-5/6 h-5/6' : 'w-1/2 h-1/2'}`}></div>
                 <img src={user.photoURL || undefined} alt="User Avatar" className="relative w-24 h-24 lg:w-32 lg:h-32 rounded-full shadow-2xl bg-white/20" />
                 {status === 'processing' && (
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-28 h-28 lg:w-36 lg:h-36 border-t-4 border-white/50 rounded-full animate-spin"></div>
                     </div>
                 )}
            </div>
            <p className="text-white/80 text-lg">{statusText}</p>
        </div>
        
        {/* End Call Button */}
        <div className="flex-shrink-0 flex justify-center py-8">
            <button
                onClick={handleHangUp}
                className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors duration-300"
                aria-label="End call"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" transform="rotate(135 12 12)" />
                </svg>
            </button>
        </div>
      </div>
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default CallView;