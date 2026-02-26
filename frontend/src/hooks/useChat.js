/**
 * Custom hook for managing chat state.
 * Handles messages, sessions, loading states, and encrypted persistence.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';

export const useChat = () => {
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const initialized = useRef(false);

    const startNewSession = useCallback(async () => {
        try {
            setError(null);
            setMessages([]);
            const { session_id } = await chatAPI.newSession();
            setSessionId(session_id);
            localStorage.setItem('empathy_session', session_id);
        } catch (err) {
            console.error('Failed to create session:', err);
            setError('Failed to create a new session');
        }
    }, []);

    // Initialize session on mount
    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const initializeSession = async () => {
            try {
                const health = await chatAPI.healthCheck();
                setIsConnected(health.status === 'healthy');

                if (health.ollama !== 'connected') {
                    setError('Ollama is not running. Please start it with: ollama serve');
                    return;
                }

                const savedSession = localStorage.getItem('empathy_session');
                if (savedSession) {
                    setSessionId(savedSession);
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
                        // Session expired
                    }
                }

                await startNewSession();

            } catch (err) {
                console.error('Failed to connect to backend:', err);
                setIsConnected(false);
                setError('Cannot connect to backend. Please ensure the server is running.');
            }
        };

        initializeSession();
    }, [startNewSession]);

    const sendMessage = useCallback(async (content, mode = 'guide') => {
        if (!content.trim() || !sessionId) return;

        setError(null);

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
                session_id: sessionId,
                mode
            });

            const aiContent = response.response;

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: aiContent,
                timestamp: new Date().toISOString()
            }]);

            // Save encrypted message pair (fire-and-forget, non-blocking)
            chatAPI.saveMessagePair(sessionId, content, aiContent).catch(() => { });

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
    }, [sessionId, startNewSession]);

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
