import React, { useState, useEffect } from 'react';
import { Message, Role } from './types';
import { fetchChatCompletion, fetchGeneratedImage } from './api';
import { useVoice } from './hooks/useVoice';
import { useAuth } from './hooks/useAuth';
import { db } from './firebase';
// FIX: Use Firebase v8 compat API for Firestore to match the rest of the app.
import firebase from 'firebase/compat/app';

import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';
import CallView from './components/CallView';

const App: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);

  const { isListening, startListening, stopListening } = useVoice({ onInterimTranscript: setTranscript });

  useEffect(() => {
    if (authLoading) return; // Wait for auth state to be determined

    if (user) {
      // User is logged in, fetch their chat history
      const fetchMessages = async () => {
        setIsLoading(true);
        // FIX: Use v8 compat syntax for Firestore document reference and retrieval.
        const chatDocRef = db.collection('chats').doc(user.uid);
        const chatDoc = await chatDocRef.get();
        if (chatDoc.exists) {
          setMessages(chatDoc.data()?.messages || []);
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

  const handleSendMessage = async (content: string, messageHistory: Message[] = messages): Promise<Message> => {
    if (isLoading || !user) {
        throw new Error("Cannot send message, user not logged in or app is busy.");
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
      setMessages(finalMessages);
      
      // Save to Firestore
      // FIX: Use v8 compat syntax for setting document data.
      const chatDocRef = db.collection('chats').doc(user.uid);
      await chatDocRef.set({ messages: finalMessages, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });

      return assistantMessage;

    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: Role.ASSISTANT,
        content: "I'm sorry, I encountered an error. Please try again.",
      };
      setMessages(prev => [...prev, errorMessage]);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStartCall = () => {
    if (user) {
      setIsCallActive(true);
    }
  };

  const handleEndCall = async (callHistory: Message[]) => {
     setIsCallActive(false);
     if (user && callHistory.length > 1) { // Only save if there's more than the initial greeting
        const finalMessages = [...messages, ...callHistory.slice(1)]; // Exclude initial greeting from AI
        setMessages(finalMessages);
        // FIX: Use v8 compat syntax for setting document data.
        const chatDocRef = db.collection('chats').doc(user.uid);
        await chatDocRef.set({ messages: finalMessages, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
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
          onStartCall={handleStartCall}
        />
      </main>
      {isCallActive && user && (
        <CallView 
          user={user} 
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

// Simple loading indicator for the auth check
const LoadingIndicator: React.FC = () => (
  <div className="flex items-center space-x-2 p-4">
    <div className="w-4 h-4 bg-white/50 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
    <div className="w-4 h-4 bg-white/50 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
    <div className="w-4 h-4 bg-white/50 rounded-full animate-pulse"></div>
  </div>
);


export default App;