import { useState, useCallback, useEffect } from 'react';
import { chatAPI } from '../services/api';

/**
 * Custom hook for managing chat state.
 * Handles messages, sessions, and loading states.
 */
export const useChat = () => {
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);

    // Initialize session on mount
    useEffect(() => {
        initializeSession();
    }, []);

    const initializeSession = async () => {
        try {
            // Check backend health
            const health = await chatAPI.healthCheck();
            setIsConnected(health.status === 'healthy');

            if (health.ollama !== 'connected') {
                setError('Ollama is not running. Please start it with: ollama serve');
                return;
            }

            // Check for existing session
            const savedSession = localStorage.getItem('empathy_session');
            if (savedSession) {
                setSessionId(savedSession);
                // Optionally load history
                try {
                    const history = await chatAPI.getHistory(savedSession);
                    if (history.messages && history.messages.length > 0) {
                        setMessages(history.messages.map(m => ({
                            role: m.role,
                            content: m.content,
                            timestamp: m.timestamp || new Date().toISOString()
                        })));
                        return;
                    }
                } catch {
                    // Session expired, create new one
                }
            }

            // Create new session
            await startNewSession();

        } catch (err) {
            console.error('Failed to connect to backend:', err);
            setIsConnected(false);
            setError('Cannot connect to backend. Please ensure the server is running.');
        }
    };

    const startNewSession = async () => {
        try {
            setError(null);
            const { session_id, message } = await chatAPI.newSession();
            setSessionId(session_id);
            localStorage.setItem('empathy_session', session_id);

            // Add welcome message
            setMessages([{
                role: 'assistant',
                content: message,
                timestamp: new Date().toISOString()
            }]);
        } catch (err) {
            console.error('Failed to create session:', err);
            setError('Failed to create a new session');
        }
    };

    const sendMessage = useCallback(async (content) => {
        if (!content.trim() || !sessionId) return;

        setError(null);

        // Add user message immediately (optimistic update)
        const userMessage = {
            role: 'user',
            content,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);

        try {
            const response = await chatAPI.sendMessage({
                message: content,
                session_id: sessionId
            });

            // Add bot response
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response.response,
                timestamp: new Date().toISOString()
            }]);
        } catch (err) {
            console.error('Failed to send message:', err);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I'm having trouble connecting right now. Please try again in a moment.",
                timestamp: new Date().toISOString(),
                isError: true
            }]);
            setError('Failed to get response');
        } finally {
            setIsTyping(false);
        }
    }, [sessionId]);

    const clearHistory = useCallback(async () => {
        if (sessionId) {
            await chatAPI.clearSession(sessionId);
        }
        await startNewSession();
    }, [sessionId]);

    return {
        messages,
        isTyping,
        sessionId,
        isConnected,
        error,
        sendMessage,
        startNewSession,
        clearHistory
    };
};

export default useChat;
