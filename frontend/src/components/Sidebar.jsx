/**
 * Sidebar Component
 * Navigation with user profile and session management.
 */

import { X, Plus, MessageCircle, Settings, Info, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

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
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 
        bg-white shadow-2xl
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
      `}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">EmpathyAI</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* User Profile */}
                {isAuthenticated ? (
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                                style={{ backgroundColor: user?.avatar_color || '#8B5CF6' }}
                            >
                                {user?.display_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 truncate">
                                    {user?.display_name || user?.username}
                                </p>
                                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                        <Link
                            to="/auth"
                            onClick={onClose}
                            className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl shadow-sm 
                       hover:shadow-md transition-all"
                        >
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">Sign In</p>
                                <p className="text-xs text-gray-500">Save your conversations</p>
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
                        className="w-full flex items-center gap-3 px-4 py-3 
                       bg-gradient-to-r from-purple-500 to-pink-500 
                       text-white rounded-xl font-medium
                       hover:shadow-lg hover:shadow-purple-200 
                       transition-all duration-200"
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
                    />
                    <NavItem
                        icon={Settings}
                        label="Settings"
                        to="/settings"
                        onClick={onClose}
                    />
                    <NavItem
                        icon={Info}
                        label="About"
                        to="/about"
                        onClick={onClose}
                    />
                </nav>

                {/* Footer */}
                <div className="p-3 border-t border-gray-100 space-y-2">
                    <button
                        onClick={() => {
                            if (window.confirm('Clear all conversation history?')) {
                                onClearHistory?.();
                                onClose();
                            }
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 
                       text-gray-600 hover:bg-gray-50 rounded-lg
                       transition-colors text-sm"
                    >
                        <X className="w-4 h-4" />
                        Clear History
                    </button>

                    {isAuthenticated && (
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 
                         text-red-600 hover:bg-red-50 rounded-lg
                         transition-colors text-sm"
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
        className={`
      w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
      text-sm font-medium transition-colors
      ${active
                ? 'bg-purple-50 text-purple-700'
                : 'text-gray-600 hover:bg-gray-50'
            }
    `}
    >
        <Icon className="w-4 h-4" />
        {label}
    </Link>
);

export default Sidebar;
