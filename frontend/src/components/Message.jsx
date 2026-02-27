/**
 * Message Component
 * Premium glassmorphic message cards — warm and organic.
 */

import { User, Heart } from "lucide-react";

const Message = ({ message }) => {
    const isUser = message.role === "user";
    const isError = message.isError;

    return (
        <div className={`flex gap-3.5 ${isUser ? "flex-row-reverse" : ""} ${isUser ? "msg-user" : "msg-assistant"}`}>
            {/* Avatar */}
            <div
                className={`flex-shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center ${!isUser ? 'animate-pulse-soft' : ''}`}
                style={{
                    background: isUser
                        ? 'linear-gradient(135deg, #C8956C 0%, #B07B52 100%)'
                        : 'linear-gradient(135deg, var(--color-primary-light) 0%, rgba(139, 126, 175, 0.08) 100%)',
                    color: isUser ? '#FFFFFF' : 'var(--color-primary)',
                    boxShadow: isUser
                        ? '0 2px 8px rgba(200, 149, 108, 0.25)'
                        : '0 2px 8px rgba(58, 125, 92, 0.1)',
                }}
            >
                {isUser ? <User className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
            </div>

            {/* Message Card */}
            <div
                className={`message-card max-w-[80%] sm:max-w-[70%] lg:max-w-[65%] px-5 py-4 ${isUser ? 'rounded-[20px] rounded-tr-lg' : 'rounded-[20px] rounded-tl-lg'} ${!isUser && !isError ? 'ai-message-glow' : ''}`}
                style={{
                    background: isUser
                        ? 'linear-gradient(135deg, #C8956C 0%, #B07B52 100%)'
                        : isError
                            ? 'var(--color-error-light)'
                            : 'var(--color-surface)',
                    color: isUser
                        ? '#FFFFFF'
                        : isError
                            ? 'var(--color-error)'
                            : 'var(--color-text)',
                    border: isUser ? 'none' : `1px solid ${isError ? 'rgba(199, 80, 80, 0.15)' : 'var(--color-border)'}`,
                    boxShadow: isUser
                        ? '0 4px 16px rgba(200, 149, 108, 0.2)'
                        : 'var(--shadow-soft)',
                    backdropFilter: isUser ? 'none' : 'blur(8px)',
                }}
            >
                {/* Role label for AI */}
                {!isUser && !isError && (
                    <div className="flex items-center gap-1.5 mb-2">
                        <Heart className="w-3 h-3" style={{ color: 'var(--color-primary)', opacity: 0.6 }} />
                        <p className="text-[10px] font-semibold tracking-wide uppercase"
                            style={{ color: 'var(--color-primary)', opacity: 0.6 }}>
                            Solace
                        </p>
                    </div>
                )}

                <p className="text-[13.5px] leading-[1.7] whitespace-pre-wrap" style={{ fontFamily: 'var(--font-body)' }}>
                    {message.content}
                </p>

                {message.timestamp && (
                    <p className="text-[10px] mt-2 font-medium"
                        style={{
                            color: isUser ? 'rgba(255,255,255,0.6)' : 'var(--color-text-muted)',
                            opacity: 0.7
                        }}>
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
