/**
 * Sidebar Component
 * Navigation and session management.
 */

import { X, Plus, MessageCircle, Settings, Info, LogOut as Trash2 } from "lucide-react";

const Sidebar = ({ isOpen, onClose, onNewChat, onClearHistory }) => {
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
                    <NavItem icon={MessageCircle} label="Chat" active />
                    <NavItem icon={Settings} label="Settings" />
                    <NavItem icon={Info} label="About" />
                </nav>

                {/* Footer */}
                <div className="p-3 border-t border-gray-100">
                    <button
                        onClick={() => {
                            if (window.confirm('Clear all conversation history?')) {
                                onClearHistory?.();
                                onClose();
                            }
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 
                       text-red-600 hover:bg-red-50 rounded-lg
                       transition-colors text-sm"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear History
                    </button>
                </div>
            </aside>
        </>
    );
};

const NavItem = ({ icon: Icon, label, active }) => (
    <button
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
    </button>
);

export default Sidebar;
