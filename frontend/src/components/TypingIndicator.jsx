/**
 * Typing Indicator Component
 * Premium breathing animation with "Listening..." label.
 */

import { Heart } from "lucide-react";

const TypingIndicator = () => {
  return (
    <div className="flex gap-3.5 msg-assistant">
      {/* Avatar */}
      <div className="flex-shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center animate-breathe"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary-light) 0%, rgba(139, 126, 175, 0.08) 100%)',
          color: 'var(--color-primary)',
          boxShadow: '0 2px 8px rgba(58, 125, 92, 0.1)',
        }}>
        <Heart className="w-4 h-4" />
      </div>

      {/* Typing bubble */}
      <div className="message-card px-5 py-4 rounded-[20px] rounded-tl-lg"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-soft)',
          backdropFilter: 'blur(8px)',
        }}>
        <div className="flex items-center gap-3">
          <div className="flex gap-2 items-center h-5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--color-primary)', animation: 'breathe-dot 2s ease-in-out infinite', animationDelay: '0ms' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--color-primary)', animation: 'breathe-dot 2s ease-in-out infinite', animationDelay: '350ms' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--color-primary)', animation: 'breathe-dot 2s ease-in-out infinite', animationDelay: '700ms' }} />
          </div>
          <span className="text-[11px] font-semibold tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
            Listening...
          </span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;