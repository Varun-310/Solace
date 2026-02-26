/**
 * Admin Dashboard — Hidden
 * Only accessible by admin email. Returns to home for non-admins.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Users, MessageSquare, Activity, Trash2, Shield, ArrowLeft, RefreshCw } from 'lucide-react';
import { authAPI } from '../services/auth';

const API_BASE = 'http://localhost:8000/api/s0l-ctrl';

const AdminDashboard = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [msgStats, setMsgStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/', { replace: true });
            return;
        }
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const headers = authAPI.getAuthHeaders();
            const [statsRes, usersRes, msgRes] = await Promise.all([
                fetch(`${API_BASE}/stats`, { headers }),
                fetch(`${API_BASE}/users`, { headers }),
                fetch(`${API_BASE}/messages/stats`, { headers })
            ]);

            if (statsRes.status === 404) {
                navigate('/', { replace: true });
                return;
            }

            setStats(await statsRes.json());
            const userData = await usersRes.json();
            setUsers(userData.users || []);
            const msgData = await msgRes.json();
            setMsgStats(msgData.per_user || []);
        } catch {
            setError('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (userId, username) => {
        if (!window.confirm(`Permanently delete user "${username}" and all their data?`)) return;
        try {
            const res = await fetch(`${API_BASE}/users/${userId}`, {
                method: 'DELETE',
                headers: authAPI.getAuthHeaders()
            });
            if (res.ok) {
                loadData();
            }
        } catch {
            setError('Failed to delete user');
        }
    };

    if (loading) {
        return (
            <div className="app-shell flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
                <div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full"
                    style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
            </div>
        );
    }

    return (
        <div className="app-shell" style={{ background: 'var(--color-bg)', overflowY: 'auto' }}>
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
                        <StatCard icon={MessageSquare} label="Messages" value={stats.total_messages} color="#D4A373" />
                        <StatCard icon={Activity} label="Sessions" value={stats.active_sessions} color="#0891B2" />
                        <StatCard icon={Users} label="New (7d)" value={stats.recent_signups} color="#40916C" />
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
                                    <th className="text-left px-5 py-2.5 text-xs font-medium hidden md:table-cell" style={{ color: 'var(--color-text-secondary)' }}>Joined</th>
                                    <th className="text-left px-5 py-2.5 text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Messages</th>
                                    <th className="text-right px-5 py-2.5 text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => {
                                    const msgs = msgStats.find(m => m.user_id === u.id);
                                    return (
                                        <tr key={u.id} style={{ borderTop: '1px solid var(--color-border-light)' }}>
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
                                            <td className="px-5 py-3 text-xs hidden md:table-cell" style={{ color: 'var(--color-text-muted)' }}>
                                                {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-5 py-3 text-sm" style={{ color: 'var(--color-text)' }}>
                                                {msgs?.message_count || 0}
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                {u.email !== 'itsvarun310@gmail.com' && (
                                                    <button
                                                        onClick={() => deleteUser(u.id, u.username)}
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
                                        <td colSpan={5} className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                            No users yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Security Note */}
                <div className="text-center text-xs py-4" style={{ color: 'var(--color-text-muted)' }}>
                    <p>🔒 All chat messages are encrypted — content cannot be viewed here</p>
                    <p className="mt-1">Admin access: {user?.email}</p>
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
