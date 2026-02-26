/**
 * API client for Solace backend.
 * Handles all communication with the FastAPI server.
 * Includes auth headers for secured endpoints.
 */

import { authAPI } from './auth';

const API_BASE = 'http://localhost:8000/api';

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
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Failed to send message');
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
   */
  async saveMessagePair(sessionId, userMsg, aiMsg) {
    if (!authAPI.isAuthenticated()) return; // Only for logged-in users

    const response = await fetch(
      `${API_BASE}/chat/save-pair?user_msg=${encodeURIComponent(userMsg)}&ai_msg=${encodeURIComponent(aiMsg)}&session_id=${sessionId}`,
      {
        method: 'POST',
        headers: authAPI.getAuthHeaders()
      }
    );
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
};

export default chatAPI;
