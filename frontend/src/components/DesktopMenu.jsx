/**
 * DesktopMenu Component
 * Floating glassmorphic dock menu for desktop screens.
 * Uses ConfirmModal for all destructive actions instead of browser's `window.confirm()`.
 */

import { useState } from "react";
import { X, Plus, Settings, Info, LogOut, User, Shield, Trash2, Heart, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import ConfirmModal from "./ConfirmModal";

const ADMIN_EMAIL = "itsvarun310@gmail.com";

const DesktopMenu = ({ isOpen, onClose, onNewChat, onClearHistory, conversations = [], onLoadConversation, onDeleteConversation }) => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    // Modal state
    const [modal, setModal] = useState({ isOpen: false, title: "", message: "", variant: "default", onConfirm: () => { } });

    const showModal = (config) => setModal({ isOpen: true, ...config });
    const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

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
            <ConfirmModal
                isOpen={modal.isOpen}
                onClose={closeModal}
                onConfirm={modal.onConfirm}
                title={modal.title}
                message={modal.message}
                confirmLabel={modal.confirmLabel || "Confirm"}
                variant={modal.variant}
            />

            {/* Invisible backdrop */}
            <div className="fixed inset-0 z-40 hidden md:block" onClick={onClose} />

            {/* Floating Dropdown Card */}
            <div
                className="fixed z-50 hidden md:block animate-fade-in"
                style={{
                    top: '70px',
                    right: '24px',
                    width: '320px',
                    maxHeight: 'calc(100vh - 100px)',
                    borderRadius: '24px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(28px) saturate(1.6)',
                    WebkitBackdropFilter: 'blur(28px) saturate(1.6)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                    border: '1px solid var(--color-border)',
                    transformOrigin: 'top right',
                    animation: 'slideUp 0.2s ease-out forwards',
                    overflowY: 'auto',
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
                            <Link to="/auth" onClick={onClose} className="flex items-center gap-3">
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

                    {/* Quick Actions */}
                    <div className="space-y-1 mb-4">
                        <MenuItem icon={Plus} label="New Chat" color="var(--color-primary)" onClick={() => { onNewChat?.(); onClose(); }} />
                        <MenuItem icon={Settings} label="Settings" onClick={() => handleNav('/settings')} />
                        <MenuItem icon={Info} label="About" onClick={() => handleNav('/about')} />
                        {isAuthenticated && user?.email?.toLowerCase() === ADMIN_EMAIL && (
                            <MenuItem icon={Shield} label="Admin Dashboard" onClick={() => handleNav('/s0lace-ctrl')} />
                        )}
                    </div>

                    {/* Past Conversations — Empathetic Design */}
                    {isAuthenticated && conversations.length > 0 && (
                        <div className="mb-4 pt-3 border-t" style={{ borderColor: 'var(--color-border-light)' }}>
                            <div className="flex items-center gap-2 px-1 mb-3">
                                <Heart className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)', opacity: 0.6 }} />
                                <p className="text-[11px] font-semibold uppercase tracking-wider"
                                    style={{ color: 'var(--color-text-muted)' }}>
                                    Your Journey
                                </p>
                            </div>
                            <div className="space-y-1.5">
                                {conversations.slice(0, 5).map((conv) => (
                                    <div key={conv.session_id} className="group relative">
                                        <button
                                            onClick={() => { onLoadConversation?.(conv.session_id); onClose(); }}
                                            className="w-full text-left p-3 rounded-xl transition-all duration-200"
                                            style={{ background: 'transparent' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(58, 125, 92, 0.05) 0%, rgba(200, 149, 108, 0.03) 100%)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <div className="flex items-start gap-2.5 pr-6">
                                                <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                                                    style={{ background: 'var(--color-primary)', opacity: 0.5 }} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm truncate font-medium"
                                                        style={{ color: 'var(--color-text-secondary)' }}>
                                                        {conv.preview}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5">
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
                                        {/* Delete button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                showModal({
                                                    title: "Delete this conversation?",
                                                    message: "This will permanently remove this conversation from your history. This cannot be undone.",
                                                    confirmLabel: "Delete",
                                                    variant: "danger",
                                                    onConfirm: () => onDeleteConversation?.(conv.session_id),
                                                });
                                            }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            style={{ color: 'var(--color-text-muted)' }}
                                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-error)'; e.currentTarget.style.background = 'var(--color-error-light)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Danger Zone */}
                    <div className="pt-3 space-y-1 border-t" style={{ borderColor: 'var(--color-border-light)' }}>
                        <MenuItem
                            icon={Trash2} label="Clear History" muted={true}
                            onClick={() => showModal({
                                title: "Clear all history?",
                                message: "This will end the current session and start fresh. Your saved conversations will remain in 'Your Journey'.",
                                confirmLabel: "Clear",
                                variant: "danger",
                                onConfirm: () => { onClearHistory?.(); onClose(); },
                            })}
                        />
                        {isAuthenticated && (
                            <MenuItem icon={LogOut} label="Sign Out" danger={true}
                                onClick={() => showModal({
                                    title: "Sign out?",
                                    message: "You can always come back. Your conversations will be safely saved.",
                                    confirmLabel: "Sign Out",
                                    variant: "gentle",
                                    onConfirm: handleLogout,
                                })}
                            />
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

const MenuItem = ({ icon: Icon, label, onClick, color, danger, muted }) => {
    let textColor = 'var(--color-text-secondary)';
    let hoverBg = 'rgba(0,0,0,0.03)';
    if (danger) { textColor = 'var(--color-error)'; hoverBg = 'var(--color-error-light)'; }
    else if (color) { textColor = color; hoverBg = 'var(--color-primary-light)'; }
    else if (muted) { textColor = 'var(--color-text-muted)'; }

    return (
        <button onClick={onClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium text-left"
            style={{ color: textColor }}
            onMouseEnter={e => e.currentTarget.style.background = hoverBg}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{label}</span>
        </button>
    );
};

export default DesktopMenu;
