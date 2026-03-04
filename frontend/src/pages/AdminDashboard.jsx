/**
 * Admin Dashboard — Enhanced
 * Only accessible by admin email. Shows user analytics, session tracking,
 * message stats, and provides management actions with custom modals.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Users, MessageSquare, Activity, Trash2, Shield, ArrowLeft, RefreshCw, Heart, Hash, Clock, Calendar, BarChart3 } from 'lucide-react';
import { authAPI } from '../services/auth';
import ConfirmModal from '../components/ConfirmModal';

const API_BASE = `${import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:8000'}/api/s0l-ctrl`;

const AdminDashboard = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [msgStats, setMsgStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal state
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '', variant: 'default', onConfirm: () => { } });
    const showModal = (config) => setModal({ isOpen: true, ...config });
    const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/', { replace: true });
            return;
        }
        // Warm up backend (Render free tier cold start)
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        fetch(`${apiUrl}/health`).catch(() => {});
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    const loadData = async () => {
        setLoading(true);
        setError('');
        const headers = authAPI.getAuthHeaders();
        const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));

        try {
            // Stats — critical (also validates admin access)
            const statsRes = await Promise.race([
                fetch(`${API_BASE}/stats`, { headers }),
                timeout(60000)
            ]);
            if (statsRes.status === 404) {
                navigate('/', { replace: true });
                return;
            }
            if (statsRes.ok) setStats(await statsRes.json());
        } catch {
            setError('Could not reach admin API — server may be waking up, try refreshing');
            setLoading(false);
            return;
        }

        // Users — load independently
        try {
            const usersRes = await Promise.race([
                fetch(`${API_BASE}/users`, { headers }),
                timeout(30000)
            ]);
            if (usersRes.ok) {
                const ud = await usersRes.json();
                setUsers(ud.users || []);
            }
        } catch { /* non-critical */ }

        // Message stats — load independently
        try {
            const msgRes = await Promise.race([
                fetch(`${API_BASE}/messages/stats`, { headers }),
                timeout(30000)
            ]);
            if (msgRes.ok) {
                const md = await msgRes.json();
                setMsgStats(md.per_user || []);
            }
        } catch { /* non-critical */ }

        setLoading(false);
    };

    const deleteUser = async (userId) => {
        try {
            const res = await fetch(`${API_BASE}/users/${userId}`, {
                method: 'DELETE',
                headers: authAPI.getAuthHeaders()
            });
            if (res.ok) loadData();
        } catch {
            setError('Failed to delete user');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
    };

    const formatTimeAgo = (dateStr) => {
        if (!dateStr) return 'Never';
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        if (days < 30) return `${days}d ago`;
        return `${Math.floor(days / 30)}mo ago`;
    };

    if (loading) {
        return (
            <div className="app-shell flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
                <div className="text-center space-y-3">
                    <div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full mx-auto"
                        style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="app-shell" style={{ background: 'var(--color-bg)', overflowY: 'auto' }}>
            <ConfirmModal
                isOpen={modal.isOpen}
                onClose={closeModal}
                onConfirm={modal.onConfirm}
                title={modal.title}
                message={modal.message}
                confirmLabel={modal.confirmLabel || "Confirm"}
                variant={modal.variant}
            />

            {/* Header */}
            <header className="glass shrink-0 px-4 sm:px-6 flex items-center justify-between"
                style={{ height: '56px', borderBottom: '1px solid var(--color-border-light)' }}>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-black/5">
                        <ArrowLeft className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                    </button>
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                        <h1 className="font-medium text-sm" style={{ fontFamily: 'var(--font-heading)' }}>Admin Panel</h1>
                    </div>
                </div>
                <button onClick={loadData} className="p-2 rounded-xl hover:bg-black/5" title="Refresh">
                    <RefreshCw className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                </button>
            </header>

            <main className="px-4 sm:px-8 lg:px-16 py-6 space-y-6">
                {error && (
                    <div className="px-4 py-3 rounded-lg text-sm" style={{ background: 'var(--color-error-light)', color: 'var(--color-error)' }}>
                        {error}
                    </div>
                )}

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <StatCard icon={Users} label="Total Users" value={stats.total_users} />
                        <StatCard icon={MessageSquare} label="Total Messages" value={stats.total_messages} color="#C8956C" />
                        <StatCard icon={Activity} label="Active Sessions" value={stats.active_sessions} color="#0891B2" />
                        <StatCard icon={Users} label="New (7 days)" value={stats.recent_signups} color="#40916C" />
                    </div>
                )}

                {/* Engagement Overview */}
                {msgStats.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <StatCard
                            icon={BarChart3}
                            label="Avg Messages/User"
                            value={Math.round(msgStats.reduce((s, m) => s + m.message_count, 0) / msgStats.length)}
                            color="#7B6BA0"
                        />
                        <StatCard
                            icon={Hash}
                            label="Total Sessions"
                            value={msgStats.reduce((s, m) => s + (m.session_count || 0), 0)}
                            color="#3A7D5C"
                        />
                        <StatCard
                            icon={Heart}
                            label="Active Users"
                            value={msgStats.filter(m => {
                                if (!m.last_active) return false;
                                return (Date.now() - new Date(m.last_active).getTime()) < 7 * 86400000;
                            }).length}
                            color="#C75050"
                        />
                    </div>
                )}

                {/* Users Table */}
                <section className="rounded-2xl overflow-hidden"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)' }}>
                    <div className="px-5 py-4 flex items-center justify-between"
                        style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                        <h2 className="font-medium text-sm flex items-center gap-2"
                            style={{ fontFamily: 'var(--font-heading)' }}>
                            <Users className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                            Registered Users ({users.length})
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ background: 'var(--color-cream)' }}>
                                    <th className="text-left px-5 py-2.5 text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>User</th>
                                    <th className="text-left px-5 py-2.5 text-xs font-medium hidden sm:table-cell" style={{ color: 'var(--color-text-secondary)' }}>Email</th>
                                    <th className="text-center px-3 py-2.5 text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Messages</th>
                                    <th className="text-center px-3 py-2.5 text-xs font-medium hidden md:table-cell" style={{ color: 'var(--color-text-secondary)' }}>Sessions</th>
                                    <th className="text-left px-3 py-2.5 text-xs font-medium hidden lg:table-cell" style={{ color: 'var(--color-text-secondary)' }}>Last Active</th>
                                    <th className="text-left px-3 py-2.5 text-xs font-medium hidden md:table-cell" style={{ color: 'var(--color-text-secondary)' }}>Joined</th>
                                    <th className="text-right px-5 py-2.5 text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => {
                                    const msgs = msgStats.find(m => m.user_id === u.id);
                                    return (
                                        <tr key={u.id} style={{ borderTop: '1px solid var(--color-border-light)' }}
                                            className="hover:bg-black/[0.015] transition-colors">
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                                                        style={{ background: 'var(--color-primary)' }}>
                                                        {u.display_name?.[0]?.toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{u.display_name || u.username}</p>
                                                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>@{u.username}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-sm hidden sm:table-cell" style={{ color: 'var(--color-text-secondary)' }}>
                                                {u.email}
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                                                    style={{
                                                        background: msgs?.message_count > 0 ? 'rgba(200, 149, 108, 0.1)' : 'transparent',
                                                        color: msgs?.message_count > 0 ? '#C8956C' : 'var(--color-text-muted)'
                                                    }}>
                                                    <MessageSquare className="w-3 h-3" />
                                                    {msgs?.message_count || 0}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-center hidden md:table-cell">
                                                <span className="inline-flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                                    <Hash className="w-3 h-3" />
                                                    {msgs?.session_count || 0}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 hidden lg:table-cell">
                                                <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                                    <Clock className="w-3 h-3" />
                                                    {formatTimeAgo(msgs?.last_active)}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 hidden md:table-cell">
                                                <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(u.created_at)}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                {u.email !== 'itsvarun310@gmail.com' && (
                                                    <button
                                                        onClick={() => showModal({
                                                            title: `Delete "${u.display_name || u.username}"?`,
                                                            message: `This will permanently delete this user and all their messages, sessions, and data. This action cannot be undone.`,
                                                            confirmLabel: "Delete User",
                                                            variant: "danger",
                                                            onConfirm: () => deleteUser(u.id),
                                                        })}
                                                        className="p-1.5 rounded-lg transition-colors"
                                                        style={{ color: 'var(--color-error)' }}
                                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-error-light)'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                        title="Delete user"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                            No users yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Security Note */}
                <div className="text-center text-xs py-4 space-y-1" style={{ color: 'var(--color-text-muted)' }}>
                    <p>🔒 All chat messages are encrypted — content cannot be viewed here</p>
                    <p>Admin access: {user?.email}</p>
                </div>
            </main>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color = '#2D6A4F' }) => (
    <div className="rounded-xl p-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)' }}>
        <div className="flex items-center gap-2 mb-2">
            <Icon className="w-4 h-4" style={{ color }} />
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
        </div>
        <p className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
            {value?.toLocaleString() || '0'}
        </p>
    </div>
);

export default AdminDashboard;
