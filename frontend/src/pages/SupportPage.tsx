import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Bot, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

export default function SupportPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: "Hello! I'm the DigiPurse support assistant. How can I help you today?",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === '' || isLoading) return;

    const userMessage: Message = { text: inputValue, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/aichat/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.text }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const botResponse: Message = { text: data.reply, sender: 'bot' };
      setMessages((prevMessages) => [...prevMessages, botResponse]);

    } catch (error) {
      console.error("Failed to fetch chatbot response:", error);
      const errorResponse: Message = { text: "Sorry, I'm having trouble connecting. Please try again later.", sender: 'bot' };
      setMessages((prevMessages) => [...prevMessages, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-[#11071F]">
      {/* Chat Header */}
      <header className="flex items-center p-4 border-b border-purple-400/20 bg-[#2B0B3F]/50">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarFallback className="bg-purple-600 text-white">
              <Bot />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold text-white">Support Chat</h1>
            <p className="text-sm text-green-400">Online</p>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              'flex items-end gap-3',
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.sender === 'bot' && (
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-purple-600 text-white">
                  <Bot />
                </AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn(
                'max-w-xs md:max-w-md lg:max-w-lg rounded-2xl px-4 py-3 text-white',
                message.sender === 'user'
                  ? 'bg-purple-600 rounded-br-none'
                  : 'bg-purple-900/50 rounded-bl-none'
              )}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex items-end gap-3 justify-start">
                <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-purple-600 text-white">
                        <Bot />
                    </AvatarFallback>
                </Avatar>
                <div className="max-w-xs md:max-w-md lg:max-w-lg rounded-2xl px-4 py-3 text-white bg-purple-900/50 rounded-bl-none">
                    <Loader2 className="h-5 w-5 animate-spin" />
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <footer className="p-4 border-t border-purple-400/20 bg-[#2B0B3F]/50">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-black/20 border-purple-400/30 text-white placeholder:text-purple-400/50 focus:border-purple-400"
            autoComplete="off"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={!inputValue.trim() || isLoading}>
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </footer>
    </div>
  );
}
