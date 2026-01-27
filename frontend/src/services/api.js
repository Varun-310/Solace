/**
 * API client for EmpathyAI backend.
 * Handles all communication with the FastAPI server.
 */

const API_BASE = 'http://localhost:8000/api';

/**
 * Chat API endpoints
 */
export const chatAPI = {
  /**
   * Send a message and get a response.
   * @param {Object} data - { message: string, session_id?: string }
   * @returns {Promise<{ response: string, session_id: string }>}
   */
  async sendMessage({ message, session_id, mode }) {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
   * @returns {Promise<{ session_id: string, message: string }>}
   */
  async newSession() {
    const response = await fetch(`${API_BASE}/session/new`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to create session');
    }

    return response.json();
  },

  /**
   * Clear a session's history.
   * @param {string} sessionId 
   */
  async clearSession(sessionId) {
    const response = await fetch(`${API_BASE}/session/${sessionId}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  /**
   * Get conversation history.
   * @param {string} sessionId 
   */
  async getHistory(sessionId) {
    const response = await fetch(`${API_BASE}/session/${sessionId}/history`);
    return response.json();
  },

  /**
   * Check if backend is healthy.
   * @returns {Promise<{ status: string, ollama: string, model: string, redis: string }>}
   */
  async healthCheck() {
    const response = await fetch(`${API_BASE}/health`);
    return response.json();
  },
};

export default chatAPI;
