/**
 * Sidebar Component
 * Clean slide-out drawer — mobile navigation.
 */

import { X, Plus, MessageCircle, Settings, Info, LogOut, User, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ADMIN_EMAIL = "itsvarun310@gmail.com";

const Sidebar = ({ isOpen, onClose, onNewChat, onClearHistory }) => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        onClose();
        navigate('/auth');
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    style={{ background: 'rgba(0,0,0,0.08)', backdropFilter: 'blur(2px)' }}
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col transform transition-transform duration-300 ease-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                style={{ background: 'var(--color-surface)', boxShadow: isOpen ? '4px 0 24px rgba(0,0,0,0.08)' : 'none' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4"
                    style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                    <h2 className="text-lg font-medium" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
                        Solace
                    </h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg transition-colors hover:bg-black/5">
                        <X className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                    </button>
                </div>

                {/* User Profile */}
                <div className="p-4" style={{ borderBottom: '1px solid var(--color-border-light)', background: 'var(--color-cream)' }}>
                    {isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            <div
                                className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-medium text-base"
                                style={{ backgroundColor: user?.avatar_color || 'var(--color-primary)' }}
                            >
                                {user?.display_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate text-sm" style={{ color: 'var(--color-text)' }}>
                                    {user?.display_name || user?.username}
                                </p>
                                <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{user?.email}</p>
                            </div>
                        </div>
                    ) : (
                        <Link to="/auth" onClick={onClose}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:shadow-sm"
                            style={{ background: 'var(--color-surface)' }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: 'var(--color-border-light)' }}>
                                <User className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                            </div>
                            <div>
                                <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>Sign In</p>
                                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Save your conversations</p>
                            </div>
                        </Link>
                    )}
                </div>

                {/* New Chat */}
                <div className="p-3">
                    <button
                        onClick={() => { onNewChat?.(); onClose(); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white font-medium transition-all hover:shadow-md"
                        style={{ background: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}
                    >
                        <Plus className="w-5 h-5" />
                        New Conversation
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1">
                    <NavItem icon={MessageCircle} label="Chat" to="/" onClick={onClose} active />
                    <NavItem icon={Settings} label="Settings" to="/settings" onClick={onClose} />
                    <NavItem icon={Info} label="About" to="/about" onClick={onClose} />
                    {isAuthenticated && user?.email?.toLowerCase() === ADMIN_EMAIL && (
                        <NavItem icon={Shield} label="Admin Panel" to="/s0lace-ctrl" onClick={onClose} />
                    )}
                </nav>

                {/* Footer */}
                <div className="p-3 space-y-1" style={{ borderTop: '1px solid var(--color-border-light)' }}>
                    <button
                        onClick={() => {
                            if (window.confirm('Clear all conversation history?')) {
                                onClearHistory?.();
                                onClose();
                            }
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm hover:bg-black/5"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        <X className="w-4 h-4" />
                        Clear History
                    </button>

                    {isAuthenticated && (
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm"
                            style={{ color: 'var(--color-error)' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-error-light)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    )}
                </div>
            </aside>
        </>
    );
};

const NavItem = ({ icon: Icon, label, to, onClick, active }) => (
    <Link
        to={to}
        onClick={onClick}
        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        style={{
            background: active ? 'var(--color-primary-light)' : 'transparent',
            color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)'
        }}
        onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
        onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
        <Icon className="w-4 h-4" />
        {label}
    </Link>
);

export default Sidebar;
