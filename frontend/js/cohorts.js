// frontend/js/cohorts.js
document.addEventListener('DOMContentLoaded', async () => {
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

    const cohortForm = document.getElementById('cohortForm');
    const cohortListDiv = document.getElementById('cohortList');
    const cohortMessageDiv = document.getElementById('cohortMessage');
    let editingCohortId = null;

    function showCohortMessage(msg, type = 'success') {
        cohortMessageDiv.textContent = msg;
        cohortMessageDiv.className = `message ${type}`;
        cohortMessageDiv.style.display = 'block';
        setTimeout(() => cohortMessageDiv.style.display = 'none', 3000);
    }

    async function fetchCohorts() {
        try {
            const cohorts = await callApi('/cohorts', 'GET');
            displayCohorts(cohorts);
        } catch (error) {
            showCohortMessage(`Error fetching cohorts: ${error.message}`, 'error');
        }
    }

    function displayCohorts(cohorts) {
        if (!cohortListDiv) return;

        let html = '<h2>Cohort List</h2>';
        if (cohorts.length === 0) {
            html += '<p>No cohorts found.</p>';
        } else {
            html += `
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            cohorts.forEach(cohort => {
                html += `
                    <tr>
                        <td>${cohort.cohortid}</td>
                        <td>${cohort.name}</td>
                        <td>${new Date(cohort.startdate).toLocaleDateString()}</td>
                        <td>${new Date(cohort.enddate).toLocaleDateString()}</td>
                        <td class="action-buttons">
                            <button onclick="editCohort(${cohort.cohortid})">Edit</button>
                            <button class="delete-btn" onclick="deleteCohort(${cohort.cohortid})">Delete</button>
                        </td>
                    </tr>
                `;
            });
            html += '</tbody></table>';
        }
        cohortListDiv.innerHTML = html;
    }

    if (cohortForm) {
        cohortForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                name: cohortForm.name.value,
                startDate: cohortForm.startDate.value,
                endDate: cohortForm.endDate.value,
            };

            try {
                if (editingCohortId) {
                    await callApi(`/cohorts/${editingCohortId}`, 'PUT', formData);
                    showCohortMessage('Cohort updated successfully!');
                } else {
                    await callApi('/cohorts', 'POST', formData);
                    showCohortMessage('Cohort added successfully!');
                }
                cohortForm.reset();
                editingCohortId = null;
                document.getElementById('cohortFormTitle').textContent = 'Add New Cohort';
                await fetchCohorts(); // Refresh list
            } catch (error) {
                showCohortMessage(`Operation failed: ${error.message}`, 'error');
            }
        });
    }

    window.editCohort = async (id) => {
        try {
            const cohort = await callApi(`/cohorts/${id}`, 'GET');
            editingCohortId = id;
            document.getElementById('cohortFormTitle').textContent = `Edit Cohort: ${cohort.name}`;
            cohortForm.name.value = cohort.name;
            cohortForm.startDate.value = cohort.startdate.split('T')[0]; // Format date for input type="date"
            cohortForm.endDate.value = cohort.enddate.split('T')[0];
        } catch (error) {
            showCohortMessage(`Error loading cohort for edit: ${error.message}`, 'error');
        }
    };

    window.deleteCohort = async (id) => {
        if (!confirm('Are you sure you want to delete this cohort? This action might affect associated students, courses, etc.')) {
            return;
        }
        try {
            await callApi(`/cohorts/${id}`, 'DELETE');
            showCohortMessage('Cohort deleted successfully!');
            await fetchCohorts(); // Refresh list
        } catch (error) {
            showCohortMessage(`Error deleting cohort: ${error.message}`, 'error');
        }
    };

    fetchCohorts(); // Initial fetch on page load
});