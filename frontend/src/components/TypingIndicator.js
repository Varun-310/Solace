/**
 * Typing Indicator Component
 * Soft animated dots when the AI is thinking.
 */

const TypingIndicator = () => {
  return (
    <div className="flex gap-3 msg-assistant">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
        style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      </div>

      {/* Typing bubble */}
      <div className="px-5 py-3.5 rounded-2xl rounded-tl-lg"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border-light)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
        }}>
        <div className="flex gap-1.5 items-center h-5">
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-primary)', animation: 'dot-bounce 1.2s ease-in-out infinite', animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-primary)', opacity: 0.7, animation: 'dot-bounce 1.2s ease-in-out infinite', animationDelay: '200ms' }} />
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-primary)', opacity: 0.4, animation: 'dot-bounce 1.2s ease-in-out infinite', animationDelay: '400ms' }} />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;