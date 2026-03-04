import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { authAPI, getStoredUser, storeAuth } from '../services/auth';

/**
 * Auth Context for global authentication state.
 */
const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check for existing session on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const storedUser = getStoredUser();
                if (storedUser) {
                    // Verify with backend
                    const freshUser = await authAPI.getProfile();
                    setUser(freshUser || storedUser);
                }
            } catch {
                // Session invalid
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = useCallback(async (username, password) => {
        setError(null);
        try {
            const data = await authAPI.login({ username, password });
            setUser(data.user);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const register = useCallback(async (username, email, password, displayName) => {
        setError(null);
        try {
            const data = await authAPI.register({ username, email, password, displayName });
            setUser(data.user);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const logout = useCallback(async () => {
        await authAPI.logout();
        setUser(null);
    }, []);

    const updateProfile = useCallback(async (updates) => {
        try {
            const updatedUser = await authAPI.updateProfile(updates);
            setUser(updatedUser);
            return updatedUser;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const googleLogin = useCallback(async (credential) => {
        setError(null);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 60000);
            let response;
            try {
                response = await fetch(`${apiUrl}/auth/google`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ credential }),
                    signal: controller.signal
                });
            } catch (fetchErr) {
                if (fetchErr.name === 'AbortError') {
                    throw new Error('Server is starting up — please try again in a few seconds');
                }
                throw fetchErr;
            } finally {
                clearTimeout(timer);
            }
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || 'Google login failed');
            }
            const data = await response.json();

            // Replicate standard auth API behavior
            storeAuth(data.token, data.user);

            setUser(data.user);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        googleLogin,
        logout,
        updateProfile,
        clearError: () => setError(null)
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
