// Authentication utility functions
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('jwt_token');
        this.userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        this.setupAuthCheck();
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.token;
    }

    // Get current user data
    getUserData() {
        return this.userData;
    }

    // Get token for API requests
    getToken() {
        return this.token;
    }

    // Logout user
    logout() {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('remember_me');
        this.token = null;
        this.userData = {};
        window.location.href = '/login.html';
    }

    // Check authentication on page load
    setupAuthCheck() {
        // Check if we're already on login page
        if (window.location.pathname === '/login.html') {
            return;
        }

        // If no token, redirect to login
        if (!this.isAuthenticated()) {
            this.logout();
            return;
        }

        // Verify token is still valid (but don't logout on failure, let API calls handle that)
        this.verifyToken().catch(() => {
            // Silent verification failure - will be handled by API calls
        });
    }

    // Verify token with server
    async verifyToken() {
        try {
            const response = await fetch('/api/v1/users/verify', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                // Token is invalid, logout
                this.logout();
                return false;
            }

            const data = await response.json();
            if (!data.success) {
                this.logout();
                return false;
            }

            return true;
        } catch (error) {
            console.error('Token verification error:', error);
            // Don't logout on network errors, just return false
            return false;
        }
    }

    // Add authorization header to fetch requests
    async authenticatedFetch(url, options = {}) {
        if (!this.isAuthenticated()) {
            this.logout();
            throw new Error('Not authenticated');
        }

        const headers = {
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...options.headers
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        // If unauthorized, logout
        if (response.status === 401) {
            this.logout();
            throw new Error('Authentication failed');
        }

        return response;
    }

    // Update user data
    updateUserData(userData) {
        this.userData = userData;
        localStorage.setItem('user_data', JSON.stringify(userData));
    }

    // Update token
    updateToken(token) {
        this.token = token;
        localStorage.setItem('jwt_token', token);
    }
}

// Global auth manager instance
const authManager = new AuthManager();

// Export for use in other scripts
window.authManager = authManager;
