/**
 * Settings Page
 * User profile and app settings management.
 */

import { useState, useEffect } from 'react';
import { ArrowLeft, User, Palette, Bell, Moon, Sun, Check, LogOut, MessageCircle, Sparkles, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';

const AVATAR_COLORS = [
    '#8B5CF6', '#EC4899', '#06B6D4', '#10B981',
    '#F59E0B', '#EF4444', '#3B82F6', '#6366F1'
];

const Settings = () => {
    const { user, isAuthenticated, updateProfile, logout } = useAuth();
    const { theme, chatMode, setTheme, setChatMode, isDark } = useSettings();
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [profileSettings, setProfileSettings] = useState({
        displayName: user?.display_name || '',
        avatarColor: user?.avatar_color || '#8B5CF6',
        notifications: user?.notifications_enabled ?? true
    });

    // Sync profile settings when user changes
    useEffect(() => {
        if (user) {
            setProfileSettings({
                displayName: user.display_name || '',
                avatarColor: user.avatar_color || '#8B5CF6',
                notifications: user.notifications_enabled ?? true
            });
        }
    }, [user]);

    const handleSaveProfile = async () => {
        if (!isAuthenticated) return;
        setSaving(true);
        try {
            await updateProfile({
                displayName: profileSettings.displayName,
                avatarColor: profileSettings.avatarColor,
                notificationsEnabled: profileSettings.notifications
            });
        } catch {
            // Error handled by hook
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/auth');
    };

    return (
        <div className={`min-h-screen transition-colors ${isDark
            ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900'
            : 'bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50'
            }`}>
            {/* Header */}
            <header className={`px-4 py-3 backdrop-blur-sm border-b transition-colors ${isDark
                ? 'bg-gray-800/80 border-gray-700'
                : 'bg-white/80 border-purple-100'
                }`}>
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <Link
                        to="/"
                        className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-purple-100'
                            }`}
                    >
                        <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                    </Link>
                    <h1 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Settings</h1>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">

                {/* Profile Section */}
                <section className={`rounded-2xl p-6 shadow-sm transition-colors ${isDark ? 'bg-gray-800' : 'bg-white'
                    }`}>
                    <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'
                        }`}>
                        <User className="w-5 h-5 text-purple-500" />
                        Profile
                    </h2>

                    {isAuthenticated ? (
                        <div className="space-y-4">
                            {/* Avatar Preview */}
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
                                    style={{ backgroundColor: profileSettings.avatarColor }}
                                >
                                    {profileSettings.displayName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                        {profileSettings.displayName || user?.username}
                                    </p>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
                                </div>
                            </div>

                            {/* Display Name */}
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'
                                    }`}>
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    value={profileSettings.displayName}
                                    onChange={(e) => setProfileSettings(prev => ({ ...prev, displayName: e.target.value }))}
                                    className={`w-full px-4 py-2 rounded-lg border outline-none transition-colors ${isDark
                                        ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-400'
                                        : 'border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
                                        }`}
                                />
                            </div>

                            {/* Avatar Color */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'
                                    }`}>
                                    Avatar Color
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {AVATAR_COLORS.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setProfileSettings(prev => ({ ...prev, avatarColor: color }))}
                                            className={`w-10 h-10 rounded-full transition-transform hover:scale-110 
                                                      ${profileSettings.avatarColor === color ? 'ring-2 ring-offset-2 ring-purple-500' : ''}`}
                                            style={{ backgroundColor: color }}
                                        >
                                            {profileSettings.avatarColor === color && (
                                                <Check className="w-5 h-5 text-white mx-auto" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Sign in to save your preferences
                            </p>
                            <Link
                                to="/auth"
                                className="inline-flex items-center gap-2 px-6 py-2 rounded-full 
                                         bg-gradient-to-r from-purple-500 to-pink-500 text-white
                                         hover:shadow-lg transition-all"
                            >
                                Sign In
                            </Link>
                        </div>
                    )}
                </section>

                {/* Chat Mode Section */}
                <section className={`rounded-2xl p-6 shadow-sm transition-colors ${isDark ? 'bg-gray-800' : 'bg-white'
                    }`}>
                    <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'
                        }`}>
                        <MessageCircle className="w-5 h-5 text-purple-500" />
                        Chat Experience
                    </h2>

                    <div className="space-y-3">
                        {/* Guide Mode */}
                        <button
                            onClick={() => setChatMode('guide')}
                            className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-start gap-4
                                      ${chatMode === 'guide'
                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                                    : isDark ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <div className={`p-2 rounded-lg ${chatMode === 'guide' ? 'bg-purple-100 text-purple-600 dark:bg-purple-800 dark:text-purple-300' : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Compassionate Guide</h3>
                                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Deep, supportive, and structured responses. Best for exploring complex feelings.
                                </p>
                            </div>
                            {chatMode === 'guide' && <Check className="w-5 h-5 text-purple-500 ml-auto" />}
                        </button>

                        {/* Friend Mode */}
                        <button
                            onClick={() => setChatMode('friend')}
                            className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-start gap-4
                                      ${chatMode === 'friend'
                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                                    : isDark ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <div className={`p-2 rounded-lg ${chatMode === 'friend' ? 'bg-purple-100 text-purple-600 dark:bg-purple-800 dark:text-purple-300' : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                                <Heart className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Caring Friend</h3>
                                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Casual, warm, and conversational. Best for everyday chat and encouragement.
                                </p>
                            </div>
                            {chatMode === 'friend' && <Check className="w-5 h-5 text-purple-500 ml-auto" />}
                        </button>
                    </div>
                </section>

                {/* Appearance Section */}
                <section className={`rounded-2xl p-6 shadow-sm transition-colors ${isDark ? 'bg-gray-800' : 'bg-white'
                    }`}>
                    <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'
                        }`}>
                        <Palette className="w-5 h-5 text-purple-500" />
                        Appearance
                    </h2>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setTheme('light')}
                            className={`flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2
                                      ${theme === 'light'
                                    ? 'border-purple-500 bg-purple-50'
                                    : isDark ? 'border-gray-600 hover:border-gray-500 text-gray-300' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <Sun className="w-5 h-5" />
                            Light
                        </button>
                        <button
                            onClick={() => setTheme('dark')}
                            className={`flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2
                                      ${theme === 'dark'
                                    ? 'border-purple-500 bg-purple-900/30 text-white'
                                    : isDark ? 'border-gray-600 hover:border-gray-500 text-gray-300' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <Moon className="w-5 h-5" />
                            Dark
                        </button>
                    </div>
                </section>

                {/* Notifications Section */}
                <section className={`rounded-2xl p-6 shadow-sm transition-colors ${isDark ? 'bg-gray-800' : 'bg-white'
                    }`}>
                    <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'
                        }`}>
                        <Bell className="w-5 h-5 text-purple-500" />
                        Notifications
                    </h2>

                    <label className="flex items-center justify-between cursor-pointer">
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Enable notifications</span>
                        <div
                            onClick={() => setProfileSettings(prev => ({ ...prev, notifications: !prev.notifications }))}
                            className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer
                                      ${profileSettings.notifications ? 'bg-purple-500' : isDark ? 'bg-gray-600' : 'bg-gray-300'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform
                                          ${profileSettings.notifications ? 'translate-x-6' : 'translate-x-1'}`} />
                        </div>
                    </label>
                </section>

                {/* Save Profile Button - only for authenticated users */}
                {isAuthenticated && (
                    <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 
                                 text-white font-medium hover:shadow-lg transition-all
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                )}

                {/* Logout Button */}
                {isAuthenticated && (
                    <button
                        onClick={handleLogout}
                        className="w-full py-3 rounded-xl border-2 border-red-200 text-red-600 
                                 font-medium hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                )}
            </main>
        </div>
    );
};

export default Settings;
