/**
 * API client for Solace backend.
 * Handles all communication with the FastAPI server.
 * Includes auth headers for secured endpoints.
 */

import { authAPI } from './auth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Chat API endpoints
 */
export const chatAPI = {
  /**
   * Send a message and get a response.
   */
  async sendMessage({ message, session_id, mode }) {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authAPI.getAuthHeaders()
      },
      body: JSON.stringify({ message, session_id, mode }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Structured error for token exhaustion (429)
      if (response.status === 429 && errorData.detail?.error_type) {
        const err = new Error(errorData.detail.message || 'Rate limited');
        err.status = 429;
        err.detail = errorData.detail;
        throw err;
      }

      throw new Error(errorData.detail || 'Failed to send message');
    }

    return response.json();
  },

  /**
   * Create a new chat session.
   */
  async newSession() {
    const response = await fetch(`${API_BASE}/session/new`, {
      method: 'POST',
      headers: authAPI.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to create session');
    }

    return response.json();
  },

  /**
   * Clear a session's history.
   */
  async clearSession(sessionId) {
    const response = await fetch(`${API_BASE}/session/${sessionId}`, {
      method: 'DELETE',
      headers: authAPI.getAuthHeaders()
    });
    return response.json();
  },

  /**
   * Get conversation history.
   */
  async getHistory(sessionId) {
    const response = await fetch(`${API_BASE}/session/${sessionId}/history`, {
      headers: authAPI.getAuthHeaders()
    });
    return response.json();
  },

  /**
   * Save an encrypted message pair (server-side encryption).
   * Fixed: sends data in POST body instead of URL params.
   */
  async saveMessagePair(sessionId, userMsg, aiMsg) {
    if (!authAPI.isAuthenticated()) return; // Only for logged-in users

    const response = await fetch(`${API_BASE}/chat/save-pair`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authAPI.getAuthHeaders()
      },
      body: JSON.stringify({
        user_msg: userMsg,
        ai_msg: aiMsg,
        session_id: sessionId
      })
    });
    return response.json();
  },

  /**
   * Get encrypted message history for a session.
   */
  async getEncryptedHistory(sessionId) {
    const response = await fetch(`${API_BASE}/chat/encrypted-history/${sessionId}`, {
      headers: authAPI.getAuthHeaders()
    });
    return response.json();
  },

  /**
   * Check if backend is healthy.
   */
  async healthCheck() {
    const response = await fetch(`${API_BASE}/health`);
    return response.json();
  },

  /**
   * List conversation sessions for the authenticated user.
   */
  async getSessions() {
    const response = await fetch(`${API_BASE}/chat/sessions`, {
      headers: authAPI.getAuthHeaders()
    });
    if (!response.ok) return { sessions: [] };
    return response.json();
  },

  /**
   * Load decrypted messages for a specific session.
   */
  async loadSessionMessages(sessionId) {
    const response = await fetch(`${API_BASE}/chat/session/${sessionId}/messages`, {
      headers: authAPI.getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to load session');
    return response.json();
  },
};

export default chatAPI;
