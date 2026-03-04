/**
 * Authentication API Service
 * Handles user registration, login, profile management, and encryption salt.
 */

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/auth';

/**
 * Fetch with timeout + auto-retry for Render cold starts.
 * First attempt may fail/timeout because Render free tier sleeps after 15 min.
 */
const fetchWithRetry = async (url, options = {}, { timeout = 45000, retries = 1 } = {}) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        try {
            const response = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timer);
            return response;
        } catch (err) {
            clearTimeout(timer);
            if (attempt < retries && (err.name === 'AbortError' || err.message === 'Failed to fetch')) {
                // Server is likely waking up from sleep — retry once
                console.log('Server waking up, retrying...');
                continue;
            }
            if (err.name === 'AbortError') {
                throw new Error('Server is starting up — please try again in a few seconds');
            }
            throw err;
        }
    }
};

// Get stored token
const getToken = () => localStorage.getItem('empathy_token');

// Store auth data
export const storeAuth = (token, user) => {
    localStorage.setItem('empathy_token', token);
    localStorage.setItem('empathy_user', JSON.stringify(user));
};

// Clear auth data
const clearAuth = () => {
    localStorage.removeItem('empathy_token');
    localStorage.removeItem('empathy_user');
    localStorage.removeItem('empathy_session');
};

// Get stored user
export const getStoredUser = () => {
    const user = localStorage.getItem('empathy_user');
    return user ? JSON.parse(user) : null;
};

export const authAPI = {
    /**
     * Register a new user.
     */
    async register({ username, email, password, displayName }) {
        const response = await fetchWithRetry(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                email,
                password,
                display_name: displayName
            }),
        }, { timeout: 60000 });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Registration failed');
        }

        const data = await response.json();
        storeAuth(data.token, data.user);
        return data;
    },

    /**
     * Login with username/email and password.
     */
    async login({ username, password }) {
        const response = await fetchWithRetry(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        }, { timeout: 60000 });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Login failed');
        }

        const data = await response.json();
        storeAuth(data.token, data.user);
        return data;
    },

    /**
     * Logout current user.
     */
    async logout() {
        const token = getToken();
        if (token) {
            try {
                await fetchWithRetry(`${API_BASE}/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                }, { timeout: 10000, retries: 0 });
            } catch {
                // Ignore errors on logout
            }
        }
        clearAuth();
    },

    /**
     * Get current user profile.
     */
    async getProfile() {
        const token = getToken();
        if (!token) return null;

        const response = await fetchWithRetry(`${API_BASE}/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                clearAuth();
                return null;
            }
            throw new Error('Failed to get profile');
        }

        const user = await response.json();
        localStorage.setItem('empathy_user', JSON.stringify(user));
        return user;
    },

    /**
     * Update user profile.
     */
    async updateProfile({ displayName, avatarColor, theme, notificationsEnabled }) {
        const token = getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetchWithRetry(`${API_BASE}/me`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                display_name: displayName,
                avatar_color: avatarColor,
                theme,
                notifications_enabled: notificationsEnabled
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to update profile');
        }

        const user = await response.json();
        localStorage.setItem('empathy_user', JSON.stringify(user));
        return user;
    },

    /**
     * Check if user is authenticated.
     */
    isAuthenticated() {
        return !!getToken();
    },

    /**
     * Get auth headers for API calls.
     */
    getAuthHeaders() {
        const token = getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
};

export default authAPI;
