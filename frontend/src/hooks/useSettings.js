/**
 * Settings Context
 * Manages app settings (theme, chat mode) for both guests and authenticated users.
 * Persists settings to localStorage for guests, syncs with backend for logged-in users.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

const SettingsContext = createContext(null);

const STORAGE_KEY = 'empathy_settings';

const DEFAULT_SETTINGS = {
    theme: 'light',
    chatMode: 'guide'
};

export const SettingsProvider = ({ children }) => {
    const { user, isAuthenticated, updateProfile } = useAuth();
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [loaded, setLoaded] = useState(false);

    // Load settings on mount
    useEffect(() => {
        // First try to load from localStorage (guest settings)
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
                theme: user.theme || prev.theme,
                chatMode: user.chat_mode || prev.chatMode
            }));
        }
    }, [isAuthenticated, user]);

    // Apply theme to document
    useEffect(() => {
        if (!loaded) return;

        const root = document.documentElement;
        if (settings.theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Also save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }, [settings, loaded]);

    // Update a single setting
    const updateSetting = useCallback(async (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));

        // If authenticated, sync to backend
        if (isAuthenticated && updateProfile) {
            try {
                const payload = {};
                if (key === 'theme') payload.theme = value;
                if (key === 'chatMode') payload.chatMode = value;
                await updateProfile(payload);
            } catch (err) {
                console.error('Failed to sync setting:', err);
            }
        }
    }, [isAuthenticated, updateProfile]);

    const setTheme = useCallback((theme) => updateSetting('theme', theme), [updateSetting]);
    const setChatMode = useCallback((mode) => updateSetting('chatMode', mode), [updateSetting]);

    return (
        <SettingsContext.Provider value={{
            theme: settings.theme,
            chatMode: settings.chatMode,
            setTheme,
            setChatMode,
            isDark: settings.theme === 'dark'
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
