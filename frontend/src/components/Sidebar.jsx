/**
 * Sidebar Component
 * Navigation with user profile and session management.
 * Supports dark mode via useSettings context.
 */

import { X, Plus, MessageCircle, Settings, Info, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useSettings } from "../hooks/useSettings";

const Sidebar = ({ isOpen, onClose, onNewChat, onClearHistory }) => {
    const { user, isAuthenticated, logout } = useAuth();
    const { isDark } = useSettings();
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
                    className={`fixed inset-0 backdrop-blur-sm z-40 lg:hidden ${isDark ? 'bg-black/40' : 'bg-black/20'
                        }`}
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 
        ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-2xl
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
      `}>
                {/* Header */}
                <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'
                    }`}>
                    <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>EmpathyAI</h2>
                    <button
                        onClick={onClose}
                        className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                            }`}
                    >
                        <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>
                </div>

                {/* User Profile */}
                {isAuthenticated ? (
                    <div className={`p-4 border-b ${isDark
                            ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-gray-700'
                            : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100'
                        }`}>
                        <div className="flex items-center gap-3">
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                                style={{ backgroundColor: user?.avatar_color || '#8B5CF6' }}
                            >
                                {user?.display_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                    {user?.display_name || user?.username}
                                </p>
                                <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={`p-4 border-b ${isDark
                            ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-gray-700'
                            : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100'
                        }`}>
                        <Link
                            to="/auth"
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl shadow-sm 
                       hover:shadow-md transition-all ${isDark ? 'bg-gray-700' : 'bg-white'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-600' : 'bg-gray-200'
                                }`}>
                                <User className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-500'}`} />
                            </div>
                            <div>
                                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Sign In</p>
                                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Save your conversations</p>
                            </div>
                        </Link>
                    </div>
                )}

                {/* New Chat Button */}
                <div className="p-3">
                    <button
                        onClick={() => {
                            onNewChat?.();
                            onClose();
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 
                       bg-gradient-to-r from-purple-500 to-pink-500 
                       text-white rounded-xl font-medium
                       hover:shadow-lg transition-all duration-200 ${isDark ? 'hover:shadow-purple-500/20' : 'hover:shadow-purple-200'
                            }`}
                    >
                        <Plus className="w-5 h-5" />
                        New Conversation
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1">
                    <NavItem
                        icon={MessageCircle}
                        label="Chat"
                        to="/"
                        onClick={onClose}
                        active
                        isDark={isDark}
                    />
                    <NavItem
                        icon={Settings}
                        label="Settings"
                        to="/settings"
                        onClick={onClose}
                        isDark={isDark}
                    />
                    <NavItem
                        icon={Info}
                        label="About"
                        to="/about"
                        onClick={onClose}
                        isDark={isDark}
                    />
                </nav>

                {/* Footer */}
                <div className={`p-3 border-t space-y-2 ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <button
                        onClick={() => {
                            if (window.confirm('Clear all conversation history?')) {
                                onClearHistory?.();
                                onClose();
                            }
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 
                       rounded-lg transition-colors text-sm ${isDark
                                ? 'text-gray-300 hover:bg-gray-700'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <X className="w-4 h-4" />
                        Clear History
                    </button>

                    {isAuthenticated && (
                        <button
                            onClick={handleLogout}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 
                         rounded-lg transition-colors text-sm ${isDark
                                    ? 'text-red-400 hover:bg-red-900/30'
                                    : 'text-red-600 hover:bg-red-50'
                                }`}
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

const NavItem = ({ icon: Icon, label, to, onClick, active, isDark }) => (
    <Link
        to={to}
        onClick={onClick}
        className={`
      w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
      text-sm font-medium transition-colors
      ${active
                ? isDark
                    ? 'bg-purple-900/50 text-purple-300'
                    : 'bg-purple-50 text-purple-700'
                : isDark
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-600 hover:bg-gray-50'
            }
    `}
    >
        <Icon className="w-4 h-4" />
        {label}
    </Link>
);

export default Sidebar;
