/**
 * Main ChatBot Component
 * The primary chat interface for EmpathyAI with better space utilization.
 */

import { useState, useEffect, useRef } from "react";
import { Send, Menu, Plus, Sparkles, AlertCircle, WifiOff } from "lucide-react";
import { useChat } from "../hooks/useChat";
import { useAuth } from "../hooks/useAuth";
import TypingIndicator from "./TypingIndicator";
import Message from "./Message";
import Sidebar from "./Sidebar";

const ChatBot = () => {
  const {
    messages,
    isTyping,
    isConnected,
    error,
    sendMessage,
    startNewSession,
    clearHistory
  } = useChat();

  const { user, isAuthenticated } = useAuth();

  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isTyping || !isConnected) return;
    const message = input;
    setInput("");
    await sendMessage(message);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={startNewSession}
        onClearHistory={clearHistory}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-sm border-b border-purple-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-800">EmpathyAI</h1>
                <p className="text-xs text-gray-500">
                  {isConnected ? (
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      {isAuthenticated ? `Hi, ${user?.display_name || user?.username}!` : 'Ready to listen'}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-600">
                      <WifiOff className="w-3 h-3" />
                      Connecting...
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={startNewSession}
            className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
            title="New conversation"
            aria-label="Start new conversation"
          >
            <Plus className="w-5 h-5 text-gray-600" />
          </button>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="px-4 py-2 bg-red-50 border-b border-red-100 flex items-center gap-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 && (
              <EmptyState isAuthenticated={isAuthenticated} userName={user?.display_name} />
            )}

            {messages.map((msg, idx) => (
              <Message key={idx} message={msg} />
            ))}

            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-purple-100">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isConnected ? "Share what's on your mind..." : "Waiting for connection..."}
                  disabled={!isConnected}
                  rows={1}
                  className="w-full px-5 py-4 rounded-2xl bg-white border border-purple-200 
                           focus:border-purple-400 focus:ring-2 focus:ring-purple-100 
                           outline-none transition-all resize-none text-gray-700 text-base
                           disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
                           shadow-sm"
                  style={{ minHeight: '56px', maxHeight: '150px' }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping || !isConnected}
                className="p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 
                         text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                         hover:shadow-xl hover:scale-105 transition-all duration-200"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">
              EmpathyAI is here to support, not replace professional help
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Empty state with prompts
const EmptyState = ({ isAuthenticated, userName }) => (
  <div className="text-center py-12">
    {/* Logo */}
    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-lg shadow-purple-200">
      <Sparkles className="w-12 h-12 text-white" />
    </div>

    {/* Welcome Text */}
    <h2 className="text-2xl font-medium text-gray-700 mb-2">
      {isAuthenticated ? `Welcome, ${userName || 'Friend'}!` : 'Welcome to EmpathyAI'}
    </h2>
    <p className="text-gray-500 max-w-md mx-auto mb-8">
      I'm here to listen and support you. Share what's on your mind,
      and let's talk through it together.
    </p>

    {/* Suggested Prompts */}
    <div className="max-w-lg mx-auto">
      <p className="text-sm text-gray-400 mb-3">Try saying...</p>
      <div className="flex flex-wrap justify-center gap-2">
        <PromptChip text="I'm feeling stressed today" />
        <PromptChip text="I need someone to talk to" />
        <PromptChip text="I'm having a rough week" />
        <PromptChip text="I feel anxious about work" />
      </div>
    </div>
  </div>
);

const PromptChip = ({ text }) => (
  <button className="px-4 py-2 rounded-full bg-white border border-purple-200 text-sm text-gray-600
                   hover:border-purple-400 hover:bg-purple-50 transition-all">
    {text}
  </button>
);

export default ChatBot;
