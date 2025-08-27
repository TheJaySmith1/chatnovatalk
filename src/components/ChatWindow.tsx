import React, { useEffect, useRef } from 'react';
import type { Message } from '../types';
import MessageBubble from './MessageBubble';
import LoadingIndicator from './LoadingIndicator';
import { Role } from '../types';

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
      className="p-4 space-y-2"
      aria-live="polite"
      aria-atomic="false"
    >
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {isLoading && (
         <MessageBubble message={{ id: 'loading', role: Role.ASSISTANT, content: ''}} isLoading={true} />
      )}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default ChatWindow;
