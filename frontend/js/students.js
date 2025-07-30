// frontend/js/students.js
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

    const studentForm = document.getElementById('studentForm');
    const studentListDiv = document.getElementById('studentList');
    const studentMessageDiv = document.getElementById('studentMessage');
    let editingStudentId = null;

    function showStudentMessage(msg, type = 'success') {
        studentMessageDiv.textContent = msg;
        studentMessageDiv.className = `message ${type}`;
        studentMessageDiv.style.display = 'block';
        setTimeout(() => studentMessageDiv.style.display = 'none', 3000);
    }

    async function fetchStudents() {
        try {
            const students = await callApi('/students', 'GET');
            displayStudents(students);
        } catch (error) {
            showStudentMessage(`Error fetching students: ${error.message}`, 'error');
        }
    }

    function displayStudents(students) {
        if (!studentListDiv) return;

        let html = '<h2>Student List</h2>';
        if (students.length === 0) {
            html += '<p>No students found.</p>';
        } else {
            html += `
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Surname</th>
                            <th>First Name</th>
                            <th>Phone</th>
                            <th>Nationality</th>
                            <th>Born Again</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            students.forEach(student => {
                html += `
                    <tr>
                        <td>${student.studentid}</td>
                        <td>${student.username}</td>
                        <td>${student.surname}</td>
                        <td>${student.firstname}</td>
                        <td>${student.phone || ''}</td>
                        <td>${student.nationality || ''}</td>
                        <td>${student.isbornagain ? 'Yes' : 'No'}</td>
                        <td class="action-buttons">
                            <button onclick="editStudent(${student.studentid})">Edit</button>
                            <button class="delete-btn" onclick="deleteStudent(${student.studentid})">Delete</button>
                        </td>
                    </tr>
                `;
            });
            html += '</tbody></table>';
        }
        studentListDiv.innerHTML = html;
    }

    if (studentForm) {
        studentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                username: studentForm.username.value,
                password: studentForm.password.value, // Only for new student
                surname: studentForm.surname.value,
                firstname: studentForm.firstname.value,
                phone: studentForm.phone.value,
                nationality: studentForm.nationality.value,
                isBornAgain: studentForm.isBornAgain.checked,
            };

            try {
                if (editingStudentId) {
                    // Update existing student
                    // Remove password for update as it's not handled via student update controller
                    delete formData.password;
                    await callApi(`/students/${editingStudentId}`, 'PUT', formData);
                    showStudentMessage('Student updated successfully!');
                } else {
                    // Create new student
                    if (!formData.password) {
                        showStudentMessage('Password is required for new student.', 'error');
                        return;
                    }
                    await callApi('/students', 'POST', formData);
                    showStudentMessage('Student added successfully!');
                }
                studentForm.reset();
                editingStudentId = null;
                document.getElementById('passwordGroup').style.display = 'block'; // Show password field again
                document.getElementById('studentFormTitle').textContent = 'Add New Student';
                await fetchStudents(); // Refresh list
            } catch (error) {
                showStudentMessage(`Operation failed: ${error.message}`, 'error');
            }
        });
    }

    // Expose functions to global scope for onclick events
    window.editStudent = async (id) => {
        try {
            const student = await callApi(`/students/${id}`, 'GET');
            editingStudentId = id;
            document.getElementById('studentFormTitle').textContent = `Edit Student: ${student.firstname} ${student.surname}`;
            studentForm.username.value = student.username;
            studentForm.surname.value = student.surname;
            studentForm.firstname.value = student.firstname;
            studentForm.phone.value = student.phone || '';
            studentForm.nationality.value = student.nationality || '';
            studentForm.isBornAgain.checked = student.isbornagain;
            // Hide password field for editing as it's not directly updated here.
            // Password change should be a separate user management feature.
            document.getElementById('passwordGroup').style.display = 'none';
        } catch (error) {
            showStudentMessage(`Error loading student for edit: ${error.message}`, 'error');
        }
    };

    window.deleteStudent = async (id) => {
        if (!confirm('Are you sure you want to delete this student? This will also delete the associated user account.')) {
            return;
        }
        try {
            await callApi(`/students/${id}`, 'DELETE');
            showStudentMessage('Student deleted successfully!');
            await fetchStudents(); // Refresh list
        } catch (error) {
            showStudentMessage(`Error deleting student: ${error.message}`, 'error');
        }
    };

    fetchStudents(); // Initial fetch on page load
});