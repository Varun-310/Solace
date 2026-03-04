/**
 * BottomSheet Component
 * Modern slide-up panel replacement for the traditional sidebar.
 * Contains: user profile, quick actions, conversation history, and sign-out.
 */

import { X, Plus, Settings, Info, LogOut, User, Shield, Trash2, Heart, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ADMIN_EMAIL = "itsvarun310@gmail.com";

const BottomSheet = ({ isOpen, onClose, onNewChat, onClearHistory, conversations = [], onLoadConversation }) => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        onClose();
        navigate('/auth');
    };

    const handleNav = (path) => {
        onClose();
        navigate(path);
    };

    const formatTimeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 transition-opacity duration-300"
                    style={{
                        background: 'rgba(0, 0, 0, 0.25)',
                        backdropFilter: 'blur(4px)',
                        WebkitBackdropFilter: 'blur(4px)',
                    }}
                    onClick={onClose}
                />
            )}

            {/* Sheet */}
            <div
                className={`fixed inset-x-0 bottom-0 z-50 transform transition-transform duration-400 ease-out
                    ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
                style={{
                    maxHeight: '85vh',
                    borderRadius: '24px 24px 0 0',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(28px) saturate(1.6)',
                    WebkitBackdropFilter: 'blur(28px) saturate(1.6)',
                    boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.08)',
                }}
            >
                {/* Pull indicator */}
                <div className="flex justify-center pt-3 pb-2">
                    <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(0,0,0,0.12)' }} />
                </div>

                <div className="px-5 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 24px)' }}>

                    {/* User Card */}
                    <div className="mb-5 p-4 rounded-2xl"
                        style={{
                            background: 'linear-gradient(135deg, rgba(58, 125, 92, 0.06) 0%, rgba(200, 149, 108, 0.06) 100%)',
                            border: '1px solid var(--color-border)',
                        }}>
                        {isAuthenticated ? (
                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-base font-semibold"
                                    style={{
                                        background: `linear-gradient(135deg, ${user?.avatar_color || '#3A7D5C'} 0%, ${user?.avatar_color || '#2B5E44'} 100%)`,
                                        boxShadow: '0 4px 12px rgba(58, 125, 92, 0.2)',
                                    }}>
                                    {user?.display_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>
                                        {user?.display_name || user?.username}
                                    </p>
                                    <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                                        {user?.email}
                                    </p>
                                </div>
                                <button onClick={onClose} className="p-2 rounded-xl"
                                    style={{ color: 'var(--color-text-muted)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <Link to="/auth" onClick={onClose}
                                    className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                        style={{ border: '2px dashed var(--color-border)', color: 'var(--color-text-muted)' }}>
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Sign In</p>
                                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Save your conversations</p>
                                    </div>
                                </Link>
                                <button onClick={onClose} className="p-2 rounded-xl"
                                    style={{ color: 'var(--color-text-muted)' }}>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions — Grid */}
                    <div className="grid grid-cols-2 gap-2.5 mb-5">
                        <ActionCard
                            icon={Plus}
                            label="New Chat"
                            sublabel="Start fresh"
                            color="#3A7D5C"
                            onClick={() => { onNewChat?.(); onClose(); }}
                        />
                        <ActionCard
                            icon={Settings}
                            label="Settings"
                            sublabel="Preferences"
                            color="#C8956C"
                            onClick={() => handleNav('/settings')}
                        />
                        <ActionCard
                            icon={Info}
                            label="About"
                            sublabel="Learn more"
                            color="#7B6BA0"
                            onClick={() => handleNav('/about')}
                        />
                        {isAuthenticated && user?.email?.toLowerCase() === ADMIN_EMAIL && (
                            <ActionCard
                                icon={Shield}
                                label="Admin"
                                sublabel="Dashboard"
                                color="#2B5E44"
                                onClick={() => handleNav('/s0lace-ctrl')}
                            />
                        )}
                    </div>

                    {/* Past Conversations — Empathetic Design */}
                    {isAuthenticated && conversations.length > 0 && (
                        <div className="mb-5 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                            <div className="flex items-center gap-2 px-1 mb-3">
                                <Heart className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)', opacity: 0.6 }} />
                                <p className="text-[11px] font-semibold uppercase tracking-wider"
                                    style={{ color: 'var(--color-text-muted)' }}>
                                    Your Journey
                                </p>
                            </div>
                            <div className="space-y-1">
                                {conversations.slice(0, 5).map((conv) => (
                                    <button
                                        key={conv.session_id}
                                        onClick={() => { onLoadConversation?.(conv.session_id); onClose(); }}
                                        className="w-full text-left p-3.5 rounded-xl transition-all duration-200 active:scale-[0.98]"
                                        style={{
                                            background: 'var(--color-surface)',
                                            border: '1px solid var(--color-border)',
                                        }}
                                    >
                                        <div className="flex items-start gap-2.5">
                                            <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                                                style={{ background: 'var(--color-primary)', opacity: 0.5 }} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm truncate font-medium"
                                                    style={{ color: 'var(--color-text-secondary)' }}>
                                                    {conv.preview}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Clock className="w-3 h-3" style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
                                                    <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                                                        {formatTimeAgo(conv.last_active)}
                                                    </span>
                                                    <span className="text-[10px]" style={{ color: 'var(--color-text-muted)', opacity: 0.5 }}>
                                                        · {conv.message_count} messages
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Danger Zone */}
                    <div className="space-y-1.5">
                        <button
                            onClick={() => {
                                if (window.confirm('Clear all conversation history?')) {
                                    onClearHistory?.();
                                    onClose();
                                }
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium"
                            style={{ color: 'var(--color-text-secondary)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear History
                        </button>

                        {isAuthenticated && (
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium"
                                style={{ color: 'var(--color-error)' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-error-light)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        )}
                    </div>

                    {/* Brand footer */}
                    <div className="flex items-center justify-center gap-2 mt-5 pt-4"
                        style={{ borderTop: '1px solid var(--color-border)' }}>
                        <Heart className="w-3 h-3" style={{ color: 'var(--color-primary)', opacity: 0.4 }} />
                        <p className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}>
                            Solace — Your compassionate companion
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

/* Action Card — grid item with icon + label */
const ActionCard = ({ icon: Icon, label, sublabel, color, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-3.5 p-4 rounded-2xl transition-all duration-200 text-left"
        style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
        }}
        onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-medium)';
            e.currentTarget.style.borderColor = color;
        }}
        onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = 'var(--color-border)';
        }}
    >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${color}12`, color }}>
            <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{label}</p>
            <p className="text-[10px] truncate" style={{ color: 'var(--color-text-muted)' }}>{sublabel}</p>
        </div>
    </button>
);

export default BottomSheet;
