// frontend/js/dashboard.js
// This script runs on dashboard.html
document.addEventListener('DOMContentLoaded', async () => {
    // Check if token exists, if not, redirect to login
    if (!localStorage.getItem('token')) {
        // Get the current pathname
        let currentPath = window.location.pathname;

        // Replace the old file name with the new file name
        // This example assumes the file name is at the end of the path
        let newPath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1) + '/login.html'; // Redirect to login if no token

        // Construct the full new URL
        let newUrl = window.location.protocol + '//' + window.location.host + newPath + window.location.search + window.location.hash;

        // Redirect to the new URL
        window.location.href = newUrl;
        return;
    }

    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay) {
        usernameDisplay.textContent = localStorage.getItem('username') || 'User';
    }

    const statsDiv = document.getElementById('stats');
    if (statsDiv) {
        statsDiv.innerHTML = 'Loading dashboard data...';
        try {
            // Fetch some basic stats (you'll need to create these API endpoints)
            // For now, let's just show a welcome message.
            const students = await callApi('/students', 'GET');
            const cohorts = await callApi('/cohorts', 'GET');
            const courses = await callApi('/courses', 'GET');

            statsDiv.innerHTML = `
                <p>Welcome back, ${localStorage.getItem('username') || 'User'}!</p>
                <p>You have access to:</p>
                <ul>
                    <li><strong>${students.length}</strong> Students</li>
                    <li><strong>${cohorts.length}</strong> Cohorts</li>
                    <li><strong>${courses.length}</strong> Courses</li>
                    </ul>
                <p>Use the navigation above to manage records.</p>
            `;
        } catch (error) {
            statsDiv.innerHTML = `<p class="message error">Failed to load dashboard data: ${error.message}</p>`;
        }
    }
});