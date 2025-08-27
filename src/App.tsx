import React, { useState, useEffect } from 'react';
import { Message, Role, UserProfile } from './types';
import { fetchChatCompletion, fetchGeneratedImage } from './api';
import { useVoice } from './hooks/useVoice';

import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';
import CallView from './components/CallView';

const LOCAL_STORAGE_KEY = 'novatalk_messages';

const mockUser: UserProfile = {
  displayName: 'You',
  photoURL: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2FlYWViMiI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYybDE2di0yYzAtMi42Ni01LjMzLTQtOC00eiIvPjwvc3ZnPg==',
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);

  const { isListening, startListening, stopListening } = useVoice({ onInterimTranscript: setTranscript });

  useEffect(() => {
    // Load messages from local storage on initial render
    try {
      const storedMessages = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      } else {
        // New user, set initial message
        const initialMessage = {
          id: crypto.randomUUID(),
          role: Role.ASSISTANT,
          content: "Hello! I'm NovaTalk. You can chat with me or request an image. Try 'generate an image of a futuristic city'.",
        };
        setMessages([initialMessage]);
      }
    } catch (error) {
      console.error("Failed to load messages from local storage", error);
       const errorMessage = {
        id: crypto.randomUUID(),
        role: Role.ASSISTANT,
        content: "Hello! I couldn't load your previous session, but we can start a new one!",
      };
      setMessages([errorMessage]);
    }
  }, []);

  const saveMessages = (updatedMessages: Message[]) => {
      setMessages(updatedMessages);
      try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedMessages));
      } catch (error) {
          console.error("Failed to save messages to local storage", error);
      }
  };

  const handleSendMessage = async (content: string, messageHistory: Message[] = messages): Promise<Message> => {
    if (isLoading) {
        throw new Error("Cannot send message, app is busy.");
    };

    const userMessage: Message = { id: crypto.randomUUID(), role: Role.USER, content };
    const updatedMessages = [...messageHistory, userMessage];
    setMessages(updatedMessages); // Update main chat view immediately
    setIsLoading(true);

    try {
      const imageKeywords = ['generate an image of', 'create a picture of', 'draw a picture of', 'make an image of'];
      const lowerCaseContent = content.toLowerCase();
      const isImageRequest = imageKeywords.some(kw => lowerCaseContent.startsWith(kw));
      
      let assistantMessage: Message;

      if (isImageRequest) {
        const imageUrl = await fetchGeneratedImage(content);
        assistantMessage = {
          id: crypto.randomUUID(),
          role: Role.ASSISTANT,
          content: "Here is the image you requested.",
          imageUrl,
        };
      } else {
        const aiResponse = await fetchChatCompletion(updatedMessages);
        assistantMessage = {
          id: crypto.randomUUID(),
          role: Role.ASSISTANT,
          content: aiResponse,
        };
      }
      
      const finalMessages = [...updatedMessages, assistantMessage];
      saveMessages(finalMessages);

      return assistantMessage;

    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: Role.ASSISTANT,
        content: "I'm sorry, an error occurred. Please check the console for details.",
      };
      // Use the saveMessages function to correctly update state and local storage
      saveMessages([...updatedMessages, errorMessage]);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStartCall = () => {
    setIsCallActive(true);
  };

  const handleEndCall = async (callHistory: Message[]) => {
     setIsCallActive(false);
     if (callHistory.length > 1) { // Only save if there's more than the initial greeting
        const finalMessages = [...messages, ...callHistory.slice(1)]; // Exclude initial greeting from AI
        saveMessages(finalMessages);
     }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col pt-24 pb-4 w-full max-w-3xl mx-auto px-4">
        <ChatWindow messages={messages} isLoading={isLoading} />
        <InputBar 
          onSendMessage={handleSendMessage}
          isListening={isListening}
          startListening={startListening}
          stopListening={stopListening}
          transcript={transcript}
          onStartCall={handleStartCall}
        />
      </main>
      {isCallActive && (
        <CallView 
          user={mockUser} 
          onEndCall={handleEndCall}
          getAiResponse={async (history) => {
             const aiResponse = await fetchChatCompletion(history);
             return {
                id: crypto.randomUUID(),
                role: Role.ASSISTANT,
                content: aiResponse,
             } as Message;
          }}
          initialMessages={messages}
        />
      )}
    </div>
  );
};

export default App;