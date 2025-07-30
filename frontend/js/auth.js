// frontend/js/auth.js

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const messageDiv = document.getElementById('message');

function showMessage(msg, type = 'success') {
    if (messageDiv) {
        messageDiv.textContent = msg;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
    }
}

function clearMessage() {
    if (messageDiv) {
        messageDiv.textContent = '';
        messageDiv.className = 'message';
        messageDiv.style.display = 'none';
    }
}

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearMessage();

        const username = loginForm.username.value;
        const password = loginForm.password.value;

        try {
            const data = await callApi('/auth/login', 'POST', { username, password }, false); // No auth required for login
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.user.username);
            showMessage('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                // Get the current pathname
                let currentPath = window.location.pathname;

                // Replace the old file name with the new file name
                // This example assumes the file name is at the end of the path
                let newPath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1) + '/dashboard.html';

                // Construct the full new URL
                let newUrl = window.location.protocol + '//' + window.location.host + newPath + window.location.search + window.location.hash;

                // Redirect to the new URL
                window.location.href = newUrl;
            }, 3500);
        } catch (error) {
            showMessage(error.message || 'Login failed. Please check your credentials.', 'error');
        }
    });
}

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearMessage();

        const username = registerForm.username.value;
        const password = registerForm.password.value;
        const confirmPassword = registerForm.confirmPassword.value;

        if (password !== confirmPassword) {
            showMessage('Passwords do not match!', 'error');
            return;
        }

        try {
            const data = await callApi('/auth/register', 'POST', { username, password }, false); // No auth required for register
            showMessage(data.message + '. You can now login.', 'success');
            registerForm.reset();
            // Optional: Redirect to login page
            // setTimeout(() => {
            //     window.location.href = '/login.html';
            // }, 2000);
        } catch (error) {
            showMessage(error.message || 'Registration failed.', 'error');
        }
    });
}

// Function to handle logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    // Get the current pathname
    let currentPath = window.location.pathname;

    // Replace the old file name with the new file name
    // This example assumes the file name is at the end of the path
    let newPath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1) + '/login.html'; // Redirect to login

    // Construct the full new URL
    let newUrl = window.location.protocol + '//' + window.location.host + newPath + window.location.search + window.location.hash;

    // Redirect to the new URL
    window.location.href = newUrl;
}

// Attach logout function to a global accessible element or add event listener on dashboard
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay) {
        usernameDisplay.textContent = localStorage.getItem('username') || 'Guest';
    }
});