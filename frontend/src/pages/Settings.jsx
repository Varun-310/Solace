/**
 * Settings Page
 * User profile and app settings management.
 */

import { useState } from 'react';
import { ArrowLeft, User, Palette, Bell, Moon, Sun, Check, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AVATAR_COLORS = [
    '#8B5CF6', '#EC4899', '#06B6D4', '#10B981',
    '#F59E0B', '#EF4444', '#3B82F6', '#6366F1'
];

const Settings = () => {
    const { user, isAuthenticated, updateProfile, logout } = useAuth();
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        displayName: user?.display_name || '',
        avatarColor: user?.avatar_color || '#8B5CF6',
        theme: user?.theme || 'light',
        notifications: user?.notifications_enabled ?? true
    });

    const handleSave = async () => {
        if (!isAuthenticated) return;
        setSaving(true);
        try {
            await updateProfile({
                displayName: settings.displayName,
                avatarColor: settings.avatarColor,
                theme: settings.theme,
                notificationsEnabled: settings.notifications
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
            {/* Header */}
            <header className="px-4 py-3 bg-white/80 backdrop-blur-sm border-b border-purple-100">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <Link
                        to="/"
                        className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <h1 className="font-semibold text-gray-800">Settings</h1>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">

                {/* Profile Section */}
                <section className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-purple-500" />
                        Profile
                    </h2>

                    {isAuthenticated ? (
                        <div className="space-y-4">
                            {/* Avatar Preview */}
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
                                    style={{ backgroundColor: settings.avatarColor }}
                                >
                                    {settings.displayName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">{settings.displayName || user?.username}</p>
                                    <p className="text-sm text-gray-500">{user?.email}</p>
                                </div>
                            </div>

                            {/* Display Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    value={settings.displayName}
                                    onChange={(e) => setSettings(prev => ({ ...prev, displayName: e.target.value }))}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 
                                             focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none"
                                />
                            </div>

                            {/* Avatar Color */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Avatar Color
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {AVATAR_COLORS.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setSettings(prev => ({ ...prev, avatarColor: color }))}
                                            className={`w-10 h-10 rounded-full transition-transform hover:scale-110 
                                                      ${settings.avatarColor === color ? 'ring-2 ring-offset-2 ring-purple-500' : ''}`}
                                            style={{ backgroundColor: color }}
                                        >
                                            {settings.avatarColor === color && (
                                                <Check className="w-5 h-5 text-white mx-auto" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-gray-500 mb-4">Sign in to save your preferences</p>
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

                {/* Appearance Section */}
                <section className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Palette className="w-5 h-5 text-purple-500" />
                        Appearance
                    </h2>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setSettings(prev => ({ ...prev, theme: 'light' }))}
                            className={`flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2
                                      ${settings.theme === 'light'
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <Sun className="w-5 h-5" />
                            Light
                        </button>
                        <button
                            onClick={() => setSettings(prev => ({ ...prev, theme: 'dark' }))}
                            className={`flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2
                                      ${settings.theme === 'dark'
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <Moon className="w-5 h-5" />
                            Dark
                        </button>
                    </div>
                </section>

                {/* Notifications Section */}
                <section className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-purple-500" />
                        Notifications
                    </h2>

                    <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-gray-700">Enable notifications</span>
                        <div
                            onClick={() => setSettings(prev => ({ ...prev, notifications: !prev.notifications }))}
                            className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer
                                      ${settings.notifications ? 'bg-purple-500' : 'bg-gray-300'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform
                                          ${settings.notifications ? 'translate-x-6' : 'translate-x-1'}`} />
                        </div>
                    </label>
                </section>

                {/* Save Button */}
                {isAuthenticated && (
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 
                                 text-white font-medium hover:shadow-lg transition-all
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
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
