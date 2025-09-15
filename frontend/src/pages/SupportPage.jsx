"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Bot, Loader2, Save, MessageSquareText, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const initialMessages = [
  {
    sender: 'bot',
    text: "Hello! I'm the DigiPurse support assistant. How can I help you today?",
  },
];

export default function SupportPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedChats, setSavedChats] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === '' || isLoading) return;

    const userMessage = { text: inputValue, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/aichat/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      const botResponse = { text: data.reply, sender: 'bot' };
      setMessages((prev) => [...prev, botResponse]);

    } catch (error) {
      console.error("Failed to fetch chatbot response:", error);
      const errorResponse = { text: "Sorry, I'm having trouble connecting. Please try again later.", sender: 'bot' };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChat = () => {
    if (messages.length <= 1) return;
    const newSavedChat = {
      id: Date.now(),
      title: messages[1]?.text.substring(0, 30) + '...',
      date: new Date().toLocaleString(),
      messages: [...messages],
    };
    setSavedChats(prev => [newSavedChat, ...prev]);
  };

  const handleLoadChat = (chat) => {
    setMessages(chat.messages);
  };
  
  // --- NEW: Function to start a new chat ---
  const handleNewChat = () => {
    setMessages(initialMessages);
  };

  return (
    <div className="h-screen w-full bg-black text-white pt-24 md:pt-28
                    bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] 
                    from-purple-900/50 via-fuchsia-900/10 to-black">
      
      {/* --- UPDATED: Grid layout is swapped --- */}
      <div className="container mx-auto h-[calc(100%-2rem)] grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">

        {/* --- CHAT HISTORY SIDEBAR (NOW ON THE LEFT) --- */}
        <div className="hidden lg:flex flex-col h-full bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-xl font-bold" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
              Chat History
            </h2>
            {/* --- NEW: "New Chat" Button --- */}
            <Button variant="ghost" size="sm" onClick={handleNewChat}>
              <PlusCircle className="h-4 w-4 mr-2" /> New Chat
            </Button>
          </header>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {savedChats.length > 0 ? (
              savedChats.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => handleLoadChat(chat)}
                  className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <p className="font-semibold truncate text-white">{chat.title}</p>
                  <p className="text-xs text-purple-200/70">{chat.date}</p>
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-purple-200/50">
                <MessageSquareText className="h-10 w-10 mb-4" />
                <p>Your saved chats will appear here.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* --- MAIN CHAT PANEL (NOW ON THE RIGHT) --- */}
        <div className="flex flex-col h-full bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
          <header className="flex items-center p-4 border-b border-white/10">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarFallback className="bg-purple-600 text-white"><Bot /></AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                  Support Chat
                </h1>
                <p className="text-sm text-green-400" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                  Online
                </p>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message, index) => (
              <div key={index} className={cn('flex items-end gap-3', message.sender === 'user' ? 'justify-end' : 'justify-start')}>
                {message.sender === 'bot' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-purple-600 text-white"><Bot /></AvatarFallback>
                  </Avatar>
                )}
                <div className={cn('max-w-xs md:max-w-md lg:max-w-lg rounded-2xl px-4 py-3 text-white', message.sender === 'user' ? 'bg-purple-600 rounded-br-none' : 'bg-purple-900/50 rounded-bl-none')}>
                  <p className="text-sm" style={{ fontFamily: 'AeonikLight, sans-serif' }}>{message.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-end gap-3 justify-start">
                <Avatar className="h-8 w-8"><AvatarFallback className="bg-purple-600 text-white"><Bot /></AvatarFallback></Avatar>
                <div className="rounded-2xl px-4 py-3 text-white bg-purple-900/50 rounded-bl-none">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <footer className="p-4 border-t border-white/10">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2 md:space-x-4">
              {/* --- NEW: "Save Chat" Button Relocated --- */}
              <Button variant="outline" size="icon" type="button" onClick={handleSaveChat} className="bg-transparent border-purple-400/30 hover:bg-purple-400/20">
                <Save className="h-5 w-5" />
              </Button>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-black/20 border-purple-400/30 text-white placeholder:text-purple-400/50 focus:border-purple-400"
                autoComplete="off"
                disabled={isLoading}
                style={{ fontFamily: 'AeonikLight, sans-serif' }}
              />
              <Button type="submit" size="icon" disabled={!inputValue.trim() || isLoading}>
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </footer>
        </div>
      </div>
    </div>
  );
}