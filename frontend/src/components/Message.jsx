/**
 * Message Component
 * Displays a single chat message with proper styling for user/assistant.
 */

import { User, Sparkles } from "lucide-react";

const Message = ({ message }) => {
    const isUser = message.role === "user";
    const isError = message.isError;

    return (
        <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
            {/* Avatar */}
            <div className={`
        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
        ${isUser
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                }
      `}>
                {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>

            {/* Message Bubble */}
            <div className={`
        max-w-[75%] px-4 py-3 rounded-2xl
        ${isUser
                    ? "bg-blue-500 text-white rounded-tr-sm"
                    : isError
                        ? "bg-red-50 text-red-700 border border-red-200 rounded-tl-sm"
                        : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm"
                }
      `}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                </p>

                {/* Timestamp (optional) */}
                {message.timestamp && (
                    <p className={`
            text-xs mt-1 opacity-60
            ${isUser ? "text-blue-100" : "text-gray-400"}
          `}>
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
