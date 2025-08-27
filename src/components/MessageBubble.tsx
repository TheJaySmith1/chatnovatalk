import React from 'react';
import { Message, Role } from '../types';

interface Props {
  message: Message;
}

const MessageBubble: React.FC<Props> = ({ message }) => {
  const isUser = message.role === Role.USER;

  const bubbleClasses = isUser
    ? 'bg-white/20 backdrop-blur-lg border border-white/25 self-end text-white'
    : 'bg-white/10 backdrop-blur-lg border border-white/20 self-start text-white/90';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-lg lg:max-w-xl p-4 rounded-2xl shadow-md my-2 flex flex-col ${bubbleClasses}`}
        role="log"
        aria-live={isUser ? "off" : "polite"}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.imageUrl && (
          <div className="mt-4 rounded-xl overflow-hidden border border-white/20">
            <img 
              src={message.imageUrl} 
              alt="AI generated image" 
              className="w-full h-auto object-cover" 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;