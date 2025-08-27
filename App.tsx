import React, { useState, useEffect } from 'react';
import { Message, Role } from './types';
import { fetchChatCompletion, fetchGeneratedImage } from './api';
import { useVoice } from './hooks/useVoice';
import { useAuth } from './hooks/useAuth';
import { db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';

const App: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState('');

  const { isListening, startListening, stopListening } = useVoice(setTranscript);

  useEffect(() => {
    if (authLoading) return; // Wait for auth state to be determined

    if (user) {
      // User is logged in, fetch their chat history
      const fetchMessages = async () => {
        setIsLoading(true);
        const chatDocRef = doc(db, 'chats', user.uid);
        const chatDoc = await getDoc(chatDocRef);
        if (chatDoc.exists()) {
          setMessages(chatDoc.data().messages || []);
        } else {
          // New user, set initial message
          const initialMessage = {
            id: crypto.randomUUID(),
            role: Role.ASSISTANT,
            content: "Hello! I'm NovaTalk. You can chat with me or request an image. Try 'generate an image of a futuristic city'.",
          };
          setMessages([initialMessage]);
        }
        setIsLoading(false);
      };
      fetchMessages();
    } else {
      // User is logged out, show sign-in prompt
      setMessages([
        {
          id: crypto.randomUUID(),
          role: Role.ASSISTANT,
          content: 'Please sign in to start chatting and save your conversation.',
        },
      ]);
    }
  }, [user, authLoading]);

  const handleSendMessage = async (content: string) => {
    if (isLoading || !user) return;

    const userMessage: Message = { id: crypto.randomUUID(), role: Role.USER, content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
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
        const history = updatedMessages;
        const aiResponse = await fetchChatCompletion(history);
        assistantMessage = {
          id: crypto.randomUUID(),
          role: Role.ASSISTANT,
          content: aiResponse,
        };
      }
      
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      
      // Save to Firestore
      const chatDocRef = doc(db, 'chats', user.uid);
      await setDoc(chatDocRef, { messages: finalMessages, updatedAt: serverTimestamp() }, { merge: true });

    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: Role.ASSISTANT,
        content: "I'm sorry, I encountered an error. Please try again.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (authLoading) {
    return (
       <div className="min-h-screen w-screen flex items-center justify-center font-sans text-white">
          <LoadingIndicator />
       </div>
    );
  }

  return (
    <div className="min-h-screen w-screen flex flex-col font-sans text-white">
      <Header user={user} />
      <main className="flex-1 flex flex-col pt-24 pb-4 w-full max-w-4xl mx-auto">
        <ChatWindow messages={messages} isLoading={isLoading && !!user} />
        <InputBar 
          onSendMessage={handleSendMessage}
          isListening={isListening}
          startListening={startListening}
          stopListening={stopListening}
          transcript={transcript}
          disabled={!user}
        />
      </main>
    </div>
  );
};

// Simple loading indicator for the auth check
const LoadingIndicator: React.FC = () => (
  <div className="flex items-center space-x-2 p-4">
    <div className="w-4 h-4 bg-white/50 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
    <div className="w-4 h-4 bg-white/50 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
    <div className="w-4 h-4 bg-white/50 rounded-full animate-pulse"></div>
  </div>
);


export default App;