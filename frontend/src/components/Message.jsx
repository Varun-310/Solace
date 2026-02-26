/**
 * Message Component
 * Journal-style message cards — full width, light only.
 */

import { User, Sparkles } from "lucide-react";

const Message = ({ message }) => {
    const isUser = message.role === "user";
    const isError = message.isError;

    return (
        <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""} ${isUser ? "msg-user" : "msg-assistant"}`}>
            {/* Avatar */}
            <div
                className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                    background: isUser ? '#FAECD5' : 'var(--color-primary-light)',
                    color: isUser ? 'var(--color-user-msg)' : 'var(--color-primary)'
                }}
            >
                {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>

            {/* Message Card */}
            <div
                className={`max-w-[80%] sm:max-w-[70%] lg:max-w-[60%] px-5 py-3.5 ${isUser ? 'rounded-2xl rounded-tr-lg' : 'rounded-2xl rounded-tl-lg'}`}
                style={{
                    background: isUser
                        ? 'var(--color-user-msg)'
                        : isError
                            ? 'var(--color-error-light)'
                            : 'var(--color-surface)',
                    color: isUser
                        ? '#FFFFFF'
                        : isError
                            ? 'var(--color-error)'
                            : 'var(--color-text)',
                    border: isUser ? 'none' : `1px solid ${isError ? '#FECACA' : 'var(--color-border-light)'}`,
                    boxShadow: isUser ? 'none' : '0 1px 2px rgba(0,0,0,0.04)'
                }}
            >
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'var(--font-body)' }}>
                    {message.content}
                </p>

                {message.timestamp && (
                    <p className="text-xs mt-1.5 opacity-50"
                        style={{ color: isUser ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)' }}>
                        {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                )}
            </div>
        </div>
    );
};

export default Message;
