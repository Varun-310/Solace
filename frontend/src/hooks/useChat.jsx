/**
 * Custom hook for managing chat state.
 * Handles messages, sessions, loading states, encrypted persistence,
 * graceful token-exhaustion handling, and conversation history.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';

export const useChat = () => {
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const [tokenExhausted, setTokenExhausted] = useState(null);
    const [conversations, setConversations] = useState([]); // Past sessions list
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

    // Fetch conversation list for logged-in users
    const fetchConversations = useCallback(async () => {
        try {
            const data = await chatAPI.getSessions();
            setConversations(data.sessions || []);
        } catch {
            // Silently fail for non-authenticated users
            setConversations([]);
        }
    }, []);

    // Load a specific conversation
    const loadConversation = useCallback(async (targetSessionId) => {
        try {
            setError(null);
            const data = await chatAPI.loadSessionMessages(targetSessionId);
            if (data.messages && data.messages.length > 0) {
                setMessages(data.messages.map(m => ({
                    role: m.role,
                    content: m.content,
                    timestamp: m.timestamp || new Date().toISOString()
                })));
                setSessionId(targetSessionId);
                localStorage.setItem('empathy_session', targetSessionId);
            }
        } catch (err) {
            console.error('Failed to load conversation:', err);
            setError('Could not load that conversation');
        }
    }, []);

    // Initialize session on mount
    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const initializeSession = async () => {
            try {
                const health = await chatAPI.healthCheck();
                setIsConnected(health.status === 'healthy' || health.status === 'degraded');

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

            // Clear any previous token exhaustion state on success
            setTokenExhausted(null);

            // Save encrypted message pair (fire-and-forget, non-blocking)
            chatAPI.saveMessagePair(sessionId, content, aiContent).catch(() => { });

        } catch (err) {
            console.error('Failed to send message:', err);

            if (err.status === 429 && err.detail?.error_type === 'token_exhausted') {
                const retrySeconds = err.detail.retry_after_seconds || 90;
                setTokenExhausted({
                    message: err.detail.message,
                    retryAfter: retrySeconds
                });
                setMessages(prev => prev.slice(0, -1));
                setTimeout(() => setTokenExhausted(null), retrySeconds * 1000);
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: "I'm having trouble connecting right now. Please try again in a moment.",
                    timestamp: new Date().toISOString(),
                    isError: true
                }]);
                setError('Failed to get response');
            }
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

    // Delete a specific conversation
    const deleteConversation = useCallback(async (targetSessionId) => {
        try {
            await chatAPI.deleteSession(targetSessionId);
            // Remove from local conversations list
            setConversations(prev => prev.filter(c => c.session_id !== targetSessionId));
            // If the deleted session is the current one, start fresh
            if (targetSessionId === sessionId) {
                await startNewSession();
            }
        } catch (err) {
            console.error('Failed to delete conversation:', err);
            setError('Could not delete that conversation');
        }
    }, [sessionId, startNewSession]);

    return {
        messages,
        isTyping,
        sessionId,
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
    };
};

export default useChat;
