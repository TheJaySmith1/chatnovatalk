import React from 'react';
import { type Message, Role } from '../types';
import LoadingIndicator from './LoadingIndicator';

interface Props {
  message: Message;
  isLoading?: boolean;
}

const MessageBubble: React.FC<Props> = ({ message, isLoading }) => {
  const isUser = message.role === Role.USER;

  const bubbleClasses = isUser
    ? 'bg-blue-600 text-white rounded-br-lg'
    : 'bg-[#373739] text-gray-200 rounded-bl-lg';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-md lg:max-w-lg p-3 rounded-2xl flex flex-col ${bubbleClasses}`}
        role="log"
        aria-live={isUser ? "off" : "polite"}
      >
        {isLoading ? (
          <LoadingIndicator />
        ) : (
          <>
            <p className="whitespace-pre-wrap">{message.content}</p>
            {message.imageUrl && (
              <div className="mt-2 rounded-lg overflow-hidden border border-white/10">
                <img 
                  src={message.imageUrl} 
                  alt="AI generated" 
                  className="w-full h-auto object-cover" 
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
