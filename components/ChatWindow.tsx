import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import MessageBubble from './MessageBubble';
import LoadingIndicator from './LoadingIndicator';

interface Props {
  messages: Message[];
  isLoading: boolean;
}

const ChatWindow: React.FC<Props> = ({ messages, isLoading }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div
      className="p-4 space-y-4"
      aria-live="polite"
      aria-atomic="false"
    >
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {isLoading && (
         <div className="flex justify-start">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 self-start text-white/90 p-1 rounded-2xl shadow-md">
              <LoadingIndicator />
            </div>
         </div>
      )}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default ChatWindow;