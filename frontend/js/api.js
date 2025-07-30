// frontend/js/api.js
const API_BASE_URL = 'http://localhost:3000/api'; // Ensure this matches your backend port

async function callApi(endpoint, method = 'GET', data = null, requiresAuth = true) {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (requiresAuth) {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found, redirecting to login.');
            // Get the current pathname
            let currentPath = window.location.pathname;

            // Replace the old file name with the new file name
            // This example assumes the file name is at the end of the path
            let newPath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1) + '/login.html'; // Redirect to login if no token

            // Construct the full new URL
            let newUrl = window.location.protocol + '//' + window.location.host + newPath + window.location.search + window.location.hash;

            // Redirect to the new URL
            window.location.href = newUrl;
            throw new Error('No authentication token found.');
        }
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (response.status === 401 || response.status === 403) {
            console.error('Authentication error, redirecting to login.');
            localStorage.removeItem('token'); // Clear invalid token

            // Redirect on auth failure
            
            // Get the current pathname
            let currentPath = window.location.pathname;

            // Replace the old file name with the new file name
            // This example assumes the file name is at the end of the path
            let newPath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1) + '/login.html'; // Redirect to login if no token

            // Construct the full new URL
            let newUrl = window.location.protocol + '//' + window.location.host + newPath + window.location.search + window.location.hash;

            // Redirect to the new URL
            window.location.href = newUrl;
        }

        const result = await response.json();

        if (!response.ok) {
            // Include message from backend error response if available
            throw new Error(result.message || `API Error: ${response.status} ${response.statusText}`);
        }

        return result;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}