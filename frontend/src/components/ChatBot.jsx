/**
 * Main ChatBot Component
 * Premium empathy-forward chat with bottom-sheet navigation.
 */

import { useState, useEffect, useRef } from "react";
import { Send, MoreHorizontal, Plus, Heart, AlertCircle, User as UserIcon, CloudRain, Feather, Leaf, Sunrise, HandHeart, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useChat } from "../hooks/useChat";
import { useAuth } from "../hooks/useAuth";
import { useSettings } from "../hooks/useSettings";
import TypingIndicator from "./TypingIndicator";
import Message from "./Message";
import BottomSheet from "./BottomSheet";
import DesktopMenu from "./DesktopMenu";

const ChatBot = () => {
  const {
    messages,
    isTyping,
    isConnected,
    error,
    tokenExhausted,
    conversations,
    sendMessage,
    startNewSession,
    clearHistory,
    fetchConversations,
    loadConversation,
    deleteConversation
  } = useChat();

  const { user, isAuthenticated } = useAuth();
  const { chatMode } = useSettings();

  const [input, setInput] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Fetch conversations when menu opens (for logged-in users)
  useEffect(() => {
    if (sheetOpen && isAuthenticated) {
      fetchConversations();
    }
  }, [sheetOpen, isAuthenticated, fetchConversations]);

  // Countdown timer for token exhaustion
  useEffect(() => {
    if (tokenExhausted) {
      setCountdown(tokenExhausted.retryAfter);
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCountdown(0);
    }
  }, [tokenExhausted]);

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
      {/* Bottom Sheet Navigation (Mobile) */}
      <div className="md:hidden">
        <BottomSheet
          isOpen={sheetOpen}
          onClose={() => setSheetOpen(false)}
          onNewChat={startNewSession}
          onClearHistory={clearHistory}
          conversations={conversations}
          onLoadConversation={loadConversation}
          onDeleteConversation={deleteConversation}
        />
      </div>

      {/* Floating Desktop Menu (Desktop) */}
      <DesktopMenu
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onNewChat={startNewSession}
        onClearHistory={clearHistory}
        conversations={conversations}
        onLoadConversation={loadConversation}
        onDeleteConversation={deleteConversation}
      />

      {/* ── Header ── */}
      <header className="glass-strong flex items-center justify-between px-4 sm:px-6 shrink-0"
        style={{
          height: '60px',
          borderBottom: '1px solid var(--color-border)',
        }}>
        <div className="flex items-center gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center animate-breathe"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary-light) 0%, rgba(200, 149, 108, 0.1) 100%)',
                  boxShadow: '0 2px 12px rgba(58, 125, 92, 0.12)'
                }}>
                <Heart className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                style={{
                  background: isConnected ? 'var(--color-success)' : 'var(--color-text-muted)',
                  borderColor: 'var(--color-surface-solid)'
                }} />
            </div>
            <div>
              <h1 className="font-semibold text-[15px] leading-tight gradient-text"
                style={{ fontFamily: 'var(--font-heading)' }}>
                Solace
              </h1>
              <p className="text-[10px] leading-tight font-medium"
                style={{ color: 'var(--color-text-muted)', letterSpacing: '0.3px' }}>
                Your compassionate companion
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* New Chat */}
          <button
            onClick={startNewSession}
            className="p-2.5 rounded-xl transition-all duration-200"
            title="New conversation"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary-light)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Profile / Menu trigger */}
          {isAuthenticated ? (
            <button
              onClick={() => setSheetOpen(true)}
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm font-semibold transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${user?.avatar_color || '#3A7D5C'} 0%, ${user?.avatar_color || '#2B5E44'} 100%)`,
              }}
              title="Menu"
            >
              {user?.display_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
            </button>
          ) : (
            <button
              onClick={() => setSheetOpen(true)}
              className="p-2.5 rounded-xl transition-all duration-200"
              title="Menu"
              style={{ color: 'var(--color-text-secondary)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary-light)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* ── Error Banner ── */}
      {error && (
        <div className="px-4 sm:px-6 py-2.5 flex items-center gap-2 text-sm shrink-0"
          style={{ background: 'var(--color-error-light)', color: 'var(--color-error)', borderBottom: '1px solid rgba(199, 80, 80, 0.1)' }}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Token Exhaustion Banner ── */}
      {tokenExhausted && (
        <div className="px-4 sm:px-8 lg:px-16 xl:px-24 py-6 shrink-0 animate-fade-in"
          style={{
            background: 'linear-gradient(135deg, rgba(58, 125, 92, 0.08) 0%, rgba(200, 149, 108, 0.06) 50%, rgba(139, 126, 175, 0.05) 100%)',
            borderBottom: '1px solid var(--color-border)',
          }}>
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-[18px] mb-4 animate-breathe"
              style={{
                background: 'linear-gradient(135deg, rgba(58, 125, 92, 0.15) 0%, rgba(200, 149, 108, 0.1) 100%)',
                boxShadow: '0 4px 20px rgba(58, 125, 92, 0.1)',
              }}>
              <Heart className="w-7 h-7" style={{ color: 'var(--color-primary)' }} />
            </div>

            <p className="text-sm leading-relaxed mb-3"
              style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>
              {tokenExhausted.message}
            </p>

            {countdown > 0 && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                }}>
                <div className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: 'var(--color-primary)' }} />
                <p className="text-xs font-medium"
                  style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
                  Ready again in ~{Math.ceil(countdown / 60)} min {countdown % 60}s
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Messages Area ── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-16 xl:px-24 py-6 chat-messages-area">
        <div className="chat-orb chat-orb-1" />
        <div className="chat-orb chat-orb-2" />
        <div className="chat-orb chat-orb-3" />

        <div className="relative z-10 max-w-3xl mx-auto">
          {messages.length === 0 && (
            <EmptyState
              isAuthenticated={isAuthenticated}
              userName={user?.display_name}
              onPromptClick={handleSend}
            />
          )}

          <div className="space-y-6">
            {messages.map((msg, idx) => (
              <Message key={idx} message={msg} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* ── Input Area ── */}
      <div className="glass-strong shrink-0 px-4 sm:px-8 lg:px-16 xl:px-24 py-4"
        style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isConnected ? "Share what you're feeling..." : "Connecting to your companion..."}
                disabled={!isConnected}
                rows={1}
                className="chat-input w-full px-5 py-3.5 rounded-2xl border outline-none transition-all duration-200 resize-none text-sm"
                style={{
                  background: 'var(--color-surface)',
                  borderColor: input ? 'var(--color-primary)' : 'var(--color-border)',
                  color: 'var(--color-text)',
                  fontFamily: 'var(--font-body)',
                  minHeight: '52px',
                  maxHeight: '140px',
                  boxShadow: input ? '0 0 0 3px var(--color-primary-glow)' : 'var(--shadow-soft)',
                }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping || !isConnected}
              className="p-3.5 rounded-2xl text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg active:scale-95"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)',
              }}
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-2.5">
            <Shield className="w-3 h-3" style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)', opacity: 0.7 }}>
              Solace is here to support, not replace professional help
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Empty State ── */
const EmptyState = ({ isAuthenticated, userName, onPromptClick }) => (
  <div className="flex flex-col items-center justify-center py-10 sm:py-16 animate-fade-in">
    <div className="relative mb-8">
      <div className="w-28 h-28 rounded-[32px] flex items-center justify-center animate-breathe"
        style={{
          background: 'linear-gradient(135deg, rgba(58, 125, 92, 0.12) 0%, rgba(200, 149, 108, 0.1) 50%, rgba(139, 126, 175, 0.08) 100%)',
          boxShadow: '0 12px 48px rgba(58, 125, 92, 0.1)',
        }}>
        <Heart className="w-14 h-14" style={{ color: 'var(--color-primary)', opacity: 0.85 }} />
      </div>
      <div className="absolute inset-[-8px] rounded-[38px] animate-pulse-soft"
        style={{ border: '1px solid var(--color-primary-light)' }} />
    </div>

    <h2 className="text-3xl sm:text-4xl font-semibold mb-3 text-center gradient-text"
      style={{ fontFamily: 'var(--font-heading)' }}>
      {isAuthenticated ? `Welcome back, ${userName || 'Friend'}` : 'A safe space to be heard'}
    </h2>

    <p className="max-w-md mx-auto mb-2 text-center text-sm sm:text-base leading-relaxed"
      style={{ color: 'var(--color-text-secondary)' }}>
      {isAuthenticated
        ? "I'm here whenever you need. Share whatever is on your heart."
        : "I listen with empathy and care. No judgment, just support."
      }
    </p>

    <div className="flex items-center gap-2 mb-10">
      <Shield className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />
      <p className="text-[11px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
        Private & encrypted conversations
      </p>
    </div>

    <div className="w-full max-w-lg">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Feather className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
        <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
          Start with something like...
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2.5">
        <PromptChip icon={CloudRain} text="I'm feeling stressed today" onClick={onPromptClick} />
        <PromptChip icon={HandHeart} text="I need someone to talk to" onClick={onPromptClick} />
        <PromptChip icon={Sunrise} text="I'm having a rough week" onClick={onPromptClick} />
        <PromptChip icon={Leaf} text="Help me feel calmer" onClick={onPromptClick} />
      </div>
    </div>
  </div>
);

const PromptChip = ({ icon: Icon, text, onClick }) => (
  <button
    onClick={() => onClick && onClick(text)}
    className="prompt-chip flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-medium cursor-pointer"
    style={{
      color: 'var(--color-text-secondary)',
      fontFamily: 'var(--font-body)',
    }}
  >
    <Icon className="w-4 h-4 flex-shrink-0" />
    {text}
  </button>
);

export default ChatBot;
