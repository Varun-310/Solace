/**
 * Main ChatBot Component
 * Full-screen immersive chat — uses the entire viewport.
 */

import { useState, useEffect, useRef } from "react";
import { Send, Menu, Plus, Sparkles, AlertCircle, User as UserIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useChat } from "../hooks/useChat";
import { useAuth } from "../hooks/useAuth";
import { useSettings } from "../hooks/useSettings";
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
  const { chatMode } = useSettings();

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

  const handleSend = async (text = input) => {
    const content = typeof text === 'string' ? text : input;
    if (!content.trim() || isTyping || !isConnected) return;

    setInput("");
    await sendMessage(content, chatMode);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="app-shell" style={{ background: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={startNewSession}
        onClearHistory={clearHistory}
      />

      {/* Header */}
      <header className="glass flex items-center justify-between px-4 sm:px-6 shrink-0"
        style={{ height: '56px', borderBottom: '1px solid var(--color-border-light)' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl transition-colors hover:bg-black/5"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--color-primary-light)' }}>
              <Sparkles className="w-4.5 h-4.5" style={{ color: 'var(--color-primary)' }} />
            </div>
            <h1 className="font-medium text-sm" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
              Solace
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={startNewSession}
            className="p-2 rounded-xl transition-colors hover:bg-black/5"
            title="New conversation"
            aria-label="Start new conversation"
          >
            <Plus className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
          </button>

          {/* Profile Avatar */}
          <Link to={isAuthenticated ? "/settings" : "/auth"}
            className="block" title={isAuthenticated ? user?.display_name : "Sign in"}>
            {isAuthenticated ? (
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium transition-transform hover:scale-105"
                style={{ backgroundColor: user?.avatar_color || 'var(--color-primary)' }}>
                {user?.display_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-black/5"
                style={{ border: '2px solid var(--color-border)' }}>
                <UserIcon className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
              </div>
            )}
          </Link>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="px-4 sm:px-6 py-2 flex items-center gap-2 text-sm shrink-0"
          style={{ background: 'var(--color-error-light)', color: 'var(--color-error)', borderBottom: '1px solid #FECACA' }}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Messages — full screen */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-16 py-6">
        {messages.length === 0 && (
          <EmptyState
            isAuthenticated={isAuthenticated}
            userName={user?.display_name}
            onPromptClick={handleSend}
          />
        )}

        <div className="space-y-5">
          {messages.map((msg, idx) => (
            <Message key={idx} message={msg} />
          ))}

          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area — full width */}
      <div className="glass shrink-0 px-4 sm:px-8 lg:px-16 py-3"
        style={{ borderTop: '1px solid var(--color-border-light)' }}>
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isConnected ? "What's on your mind..." : "Waiting for connection..."}
              disabled={!isConnected}
              rows={1}
              className="w-full px-5 py-3.5 rounded-2xl border outline-none transition-all resize-none text-sm"
              style={{
                background: 'var(--color-surface)',
                borderColor: input ? 'var(--color-primary)' : 'var(--color-border)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-body)',
                minHeight: '52px',
                maxHeight: '140px'
              }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping || !isConnected}
            className="p-3.5 rounded-2xl text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-md"
            style={{ background: 'var(--color-primary)' }}
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-center mt-2" style={{ color: 'var(--color-text-muted)' }}>
          Solace is here to support, not replace professional help
        </p>
      </div>
    </div>
  );
};

// Empty state
const EmptyState = ({ isAuthenticated, userName, onPromptClick }) => (
  <div className="flex flex-col items-center justify-center py-16 sm:py-24 animate-fade-in">
    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
      style={{ background: 'var(--color-primary-light)' }}>
      <Sparkles className="w-10 h-10" style={{ color: 'var(--color-primary)' }} />
    </div>

    <h2 className="text-2xl sm:text-3xl font-medium mb-2 text-center"
      style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
      {isAuthenticated ? `Welcome back, ${userName || 'Friend'}` : 'Welcome to Solace'}
    </h2>
    <p className="max-w-lg mx-auto mb-10 text-center text-sm sm:text-base"
      style={{ color: 'var(--color-text-secondary)' }}>
      I'm here to listen and support you. Share what's on your mind,
      and let's talk through it together.
    </p>

    <div className="w-full">
      <p className="text-xs mb-3 text-center" style={{ color: 'var(--color-text-muted)' }}>Try saying...</p>
      <div className="flex flex-wrap justify-center gap-2">
        <PromptChip text="I'm feeling stressed today" onClick={onPromptClick} />
        <PromptChip text="I need someone to talk to" onClick={onPromptClick} />
        <PromptChip text="I'm having a rough week" onClick={onPromptClick} />
        <PromptChip text="I feel anxious about work" onClick={onPromptClick} />
      </div>
    </div>
  </div>
);

const PromptChip = ({ text, onClick }) => (
  <button
    onClick={() => onClick && onClick(text)}
    className="px-4 py-2 rounded-full border text-sm transition-all hover:shadow-sm"
    style={{
      background: 'var(--color-surface)',
      borderColor: 'var(--color-border)',
      color: 'var(--color-text-secondary)',
      fontFamily: 'var(--font-body)'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = 'var(--color-primary)';
      e.currentTarget.style.color = 'var(--color-primary)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = 'var(--color-border)';
      e.currentTarget.style.color = 'var(--color-text-secondary)';
    }}
  >
    {text}
  </button>
);

export default ChatBot;
