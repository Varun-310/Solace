/**
 * Settings Page
 * Clean, minimal settings — light only.
 */

import { useState, useEffect } from 'react';
import { ArrowLeft, User, Bell, Check, LogOut, MessageCircle, Sparkles, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';

const AVATAR_COLORS = [
    '#2D6A4F', '#D4A373', '#0891B2', '#40916C',
    '#D97706', '#DC2626', '#3B82F6', '#6366F1'
];

const Settings = () => {
    const { user, isAuthenticated, updateProfile, logout } = useAuth();
    const { chatMode, setChatMode } = useSettings();
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [profileSettings, setProfileSettings] = useState({
        displayName: user?.display_name || '',
        avatarColor: user?.avatar_color || '#2D6A4F',
        notifications: user?.notifications_enabled ?? true
    });

    useEffect(() => {
        if (user) {
            setProfileSettings({
                displayName: user.display_name || '',
                avatarColor: user.avatar_color || '#2D6A4F',
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
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/auth');
    };

    return (
        <div className="app-shell" style={{ background: 'var(--color-bg)', overflowY: 'auto' }}>
            {/* Header */}
            <header className="glass shrink-0 px-4 sm:px-6 flex items-center gap-3"
                style={{ height: '56px', borderBottom: '1px solid var(--color-border-light)' }}>
                <Link to="/" className="p-2 rounded-xl transition-colors hover:bg-black/5">
                    <ArrowLeft className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                </Link>
                <h1 className="font-medium" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>Settings</h1>
            </header>

            {/* Content */}
            <main className="px-4 sm:px-8 lg:px-16 py-8 space-y-6">

                {/* Profile */}
                <Section icon={User} title="Profile">
                    {isAuthenticated ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-lg font-medium"
                                    style={{ backgroundColor: profileSettings.avatarColor }}>
                                    {profileSettings.displayName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                                        {profileSettings.displayName || user?.username}
                                    </p>
                                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{user?.email}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    value={profileSettings.displayName}
                                    onChange={(e) => setProfileSettings(prev => ({ ...prev, displayName: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border outline-none transition-colors text-sm"
                                    style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                                    Avatar Color
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {AVATAR_COLORS.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setProfileSettings(prev => ({ ...prev, avatarColor: color }))}
                                            className={`w-9 h-9 rounded-xl transition-transform hover:scale-110 flex items-center justify-center
                                                ${profileSettings.avatarColor === color ? 'ring-2 ring-offset-2' : ''}`}
                                            style={{ backgroundColor: color, ringColor: 'var(--color-primary)' }}
                                        >
                                            {profileSettings.avatarColor === color && <Check className="w-4 h-4 text-white" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>Sign in to save your preferences</p>
                            <Link to="/auth" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:shadow-md"
                                style={{ background: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
                                Sign In
                            </Link>
                        </div>
                    )}
                </Section>

                {/* Chat Mode */}
                <Section icon={MessageCircle} title="Chat Experience">
                    <div className="space-y-3">
                        <ModeCard
                            icon={Sparkles}
                            title="Compassionate Guide"
                            desc="Deep, supportive, and structured responses. Best for exploring complex feelings."
                            active={chatMode === 'guide'}
                            onClick={() => setChatMode('guide')}
                        />
                        <ModeCard
                            icon={Heart}
                            title="Caring Friend"
                            desc="Casual, warm, and conversational. Best for everyday chat and encouragement."
                            active={chatMode === 'friend'}
                            onClick={() => setChatMode('friend')}
                        />
                    </div>
                </Section>

                {/* Notifications */}
                <Section icon={Bell} title="Notifications">
                    <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm" style={{ color: 'var(--color-text)' }}>Enable notifications</span>
                        <div
                            onClick={() => setProfileSettings(prev => ({ ...prev, notifications: !prev.notifications }))}
                            className="w-11 h-6 rounded-full transition-colors relative cursor-pointer"
                            style={{ background: profileSettings.notifications ? 'var(--color-primary)' : 'var(--color-border)' }}
                        >
                            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${profileSettings.notifications ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </div>
                    </label>
                </Section>

                {/* Actions */}
                {isAuthenticated && (
                    <div className="space-y-3">
                        <button
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="w-full py-3.5 rounded-xl text-white font-medium transition-all hover:shadow-md disabled:opacity-50"
                            style={{ background: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}
                        >
                            {saving ? 'Saving...' : 'Save Profile'}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full py-3.5 rounded-xl border-2 font-medium flex items-center justify-center gap-2 transition-all"
                            style={{ borderColor: '#FECACA', color: 'var(--color-error)', fontFamily: 'var(--font-heading)' }}
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

const Section = ({ icon: Icon, title, children }) => (
    <section className="rounded-2xl p-5 sm:p-6"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)' }}>
        <h2 className="text-base font-medium mb-4 flex items-center gap-2"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
            <Icon className="w-4.5 h-4.5" style={{ color: 'var(--color-primary)' }} />
            {title}
        </h2>
        {children}
    </section>
);

const ModeCard = ({ icon: Icon, title, desc, active, onClick }) => (
    <button
        onClick={onClick}
        className="w-full p-4 rounded-xl border-2 transition-all text-left flex items-start gap-3"
        style={{
            borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
            background: active ? 'var(--color-primary-light)' : 'transparent'
        }}
    >
        <div className="p-2 rounded-lg"
            style={{
                background: active ? 'var(--color-primary)' : 'var(--color-border-light)',
                color: active ? '#FFFFFF' : 'var(--color-text-muted)'
            }}>
            <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
            <h3 className="font-medium text-sm" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>{title}</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{desc}</p>
        </div>
        {active && <Check className="w-4 h-4 mt-1 shrink-0" style={{ color: 'var(--color-primary)' }} />}
    </button>
);

export default Settings;
