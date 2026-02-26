/**
 * Settings Context
 * Manages app settings (chat mode only — light theme always).
 * Persists settings to localStorage for guests, syncs with backend for logged-in users.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

const SettingsContext = createContext(null);

const STORAGE_KEY = 'empathy_settings';

const DEFAULT_SETTINGS = {
    chatMode: 'guide'
};

export const SettingsProvider = ({ children }) => {
    const { user, isAuthenticated, updateProfile } = useAuth();
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [loaded, setLoaded] = useState(false);

    // Load settings on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setSettings(prev => ({ ...prev, ...parsed }));
            } catch {
                // Invalid JSON, ignore
            }
        }
        setLoaded(true);
    }, []);

    // Sync with user settings when authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            setSettings(prev => ({
                ...prev,
                chatMode: user.chat_mode || prev.chatMode
            }));
        }
    }, [isAuthenticated, user]);

    // Save to localStorage when settings change
    useEffect(() => {
        if (!loaded) return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }, [settings, loaded]);

    // Update a single setting
    const updateSetting = useCallback(async (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));

        // If authenticated, sync to backend
        if (isAuthenticated && updateProfile) {
            try {
                const payload = {};
                if (key === 'chatMode') payload.chatMode = value;
                await updateProfile(payload);
            } catch (err) {
                console.error('Failed to sync setting:', err);
            }
        }
    }, [isAuthenticated, updateProfile]);

    const setChatMode = useCallback((mode) => updateSetting('chatMode', mode), [updateSetting]);

    return (
        <SettingsContext.Provider value={{
            chatMode: settings.chatMode,
            setChatMode
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export default useSettings;
