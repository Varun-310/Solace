/**
 * DesktopMenu Component
 * Floating glassmorphic dock menu for desktop screens.
 */

import { X, Plus, Settings, Info, LogOut, User, Shield, Trash2, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ADMIN_EMAIL = "itsvarun310@gmail.com";

const DesktopMenu = ({ isOpen, onClose, onNewChat, onClearHistory }) => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleLogout = async () => {
        await logout();
        onClose();
        navigate('/auth');
    };

    const handleNav = (path) => {
        onClose();
        navigate(path);
    };

    return (
        <>
            {/* Invisible backdrop to dismiss click outside */}
            <div
                className="fixed inset-0 z-40 hidden md:block"
                onClick={onClose}
            />

            {/* Floating Dropdown Card */}
            <div
                className="fixed z-50 hidden md:block animate-fade-in"
                style={{
                    top: '70px',
                    right: '24px',
                    width: '320px',
                    borderRadius: '24px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(28px) saturate(1.6)',
                    WebkitBackdropFilter: 'blur(28px) saturate(1.6)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                    border: '1px solid var(--color-border)',
                    transformOrigin: 'top right',
                    animation: 'slideUp 0.2s ease-out forwards'
                }}
            >
                <div className="p-5">
                    {/* User Card */}
                    <div className="mb-4 p-4 rounded-2xl"
                        style={{
                            background: 'linear-gradient(135deg, rgba(58, 125, 92, 0.06) 0%, rgba(200, 149, 108, 0.06) 100%)',
                            border: '1px solid var(--color-border)',
                        }}>
                        {isAuthenticated ? (
                            <div className="flex items-center gap-3">
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
                            </div>
                        ) : (
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
                        )}
                    </div>

                    {/* Quick Actions List */}
                    <div className="space-y-1 mb-4">
                        <MenuItem icon={Plus} label="New Chat" color="var(--color-primary)" onClick={() => { onNewChat?.(); onClose(); }} />
                        <MenuItem icon={Settings} label="Settings" onClick={() => handleNav('/settings')} />
                        <MenuItem icon={Info} label="About" onClick={() => handleNav('/about')} />
                        {isAuthenticated && user?.email?.toLowerCase() === ADMIN_EMAIL && (
                            <MenuItem icon={Shield} label="Admin Dashboard" onClick={() => handleNav('/s0lace-ctrl')} />
                        )}
                    </div>

                    {/* Danger Zone */}
                    <div className="pt-3 space-y-1 border-t" style={{ borderColor: 'var(--color-border-light)' }}>
                        <MenuItem
                            icon={Trash2}
                            label="Clear History"
                            danger={false}
                            muted={true}
                            onClick={() => {
                                if (window.confirm('Clear all conversation history?')) {
                                    onClearHistory?.();
                                    onClose();
                                }
                            }}
                        />

                        {isAuthenticated && (
                            <MenuItem icon={LogOut} label="Sign Out" danger={true} onClick={handleLogout} />
                        )}
                    </div>

                    {/* Brand footer */}
                    <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t"
                        style={{ borderColor: 'var(--color-border-light)' }}>
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

/* Menu Item */
const MenuItem = ({ icon: Icon, label, onClick, color, danger, muted }) => {
    let textColor = 'var(--color-text-secondary)';
    let hoverBg = 'rgba(0,0,0,0.03)';

    if (danger) {
        textColor = 'var(--color-error)';
        hoverBg = 'var(--color-error-light)';
    } else if (color) {
        textColor = color;
        hoverBg = 'var(--color-primary-light)';
    } else if (muted) {
        textColor = 'var(--color-text-muted)';
    }

    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium text-left"
            style={{ color: textColor }}
            onMouseEnter={e => e.currentTarget.style.background = hoverBg}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{label}</span>
        </button>
    );
};

export default DesktopMenu;
