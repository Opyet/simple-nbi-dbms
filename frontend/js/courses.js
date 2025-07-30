// frontend/js/courses.js
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

    const courseForm = document.getElementById('courseForm');
    const courseListDiv = document.getElementById('courseList');
    const courseMessageDiv = document.getElementById('courseMessage');
    const sectionSelect = document.getElementById('sectionid');
    let editingCourseId = null;

    function showCourseMessage(msg, type = 'success') {
        courseMessageDiv.textContent = msg;
        courseMessageDiv.className = `message ${type}`;
        courseMessageDiv.style.display = 'block';
        setTimeout(() => courseMessageDiv.style.display = 'none', 3000);
    }

    async function fetchSections() {
        try {
            // This assumes you create a /api/coursesections endpoint using commonController
            const sections = await callApi('/coursesections', 'GET');
            sectionSelect.innerHTML = '<option value="">None</option>'; // Allow no section
            sections.forEach(section => {
                const option = document.createElement('option');
                option.value = section.sectionid;
                option.textContent = section.sectionname;
                sectionSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching course sections:', error);
            showCourseMessage('Could not load course sections.', 'error');
        }
    }

    async function fetchCourses() {
        try {
            const courses = await callApi('/courses', 'GET');
            displayCourses(courses);
        } catch (error) {
            showCourseMessage(`Error fetching courses: ${error.message}`, 'error');
        }
    }

    function displayCourses(courses) {
        if (!courseListDiv) return;

        let html = '<h2>Course List</h2>';
        if (courses.length === 0) {
            html += '<p>No courses found.</p>';
        } else {
            html += `
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Code</th>
                            <th>Units</th>
                            <th>Teaching Hours</th>
                            <th>Section</th>
                            <th>Types</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            courses.forEach(course => {
                html += `
                    <tr>
                        <td>${course.courseid}</td>
                        <td>${course.title}</td>
                        <td>${course.code}</td>
                        <td>${course.units}</td>
                        <td>${course.teachinghours || 'N/A'}</td>
                        <td>${course.sectionname || 'N/A'}</td>
                        <td>${course.types ? course.types.join(', ') : 'N/A'}</td>
                        <td class="action-buttons">
                            <button onclick="editCourse(${course.courseid})">Edit</button>
                            <button class="delete-btn" onclick="deleteCourse(${course.courseid})">Delete</button>
                        </td>
                    </tr>
                `;
            });
            html += '</tbody></table>';
        }
        courseListDiv.innerHTML = html;
    }

    if (courseForm) {
        courseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                title: courseForm.title.value,
                code: courseForm.code.value,
                description: courseForm.description.value,
                units: parseInt(courseForm.units.value),
                _sectionid: courseForm.sectionid.value ? parseInt(courseForm.sectionid.value) : null,
                teachingHours: courseForm.teachingHours.value ? parseInt(courseForm.teachingHours.value) : null,
                types: courseForm.courseTypes.value.split(',').map(t => t.trim()).filter(t => t !== ''),
            };

            try {
                if (editingCourseId) {
                    await callApi(`/courses/${editingCourseId}`, 'PUT', formData);
                    showCourseMessage('Course updated successfully!');
                } else {
                    await callApi('/courses', 'POST', formData);
                    showCourseMessage('Course added successfully!');
                }
                courseForm.reset();
                editingCourseId = null;
                document.getElementById('courseFormTitle').textContent = 'Add New Course';
                await fetchCourses(); // Refresh list
            } catch (error) {
                showCourseMessage(`Operation failed: ${error.message}`, 'error');
            }
        });
    }

    window.editCourse = async (id) => {
        try {
            const course = await callApi(`/courses/${id}`, 'GET');
            editingCourseId = id;
            document.getElementById('courseFormTitle').textContent = `Edit Course: ${course.title}`;
            courseForm.title.value = course.title;
            courseForm.code.value = course.code;
            courseForm.description.value = course.description || '';
            courseForm.units.value = course.units;
            courseForm.sectionid.value = course._sectionid || '';
            courseForm.teachingHours.value = course.teachingHours || '';
            courseForm.courseTypes.value = course.types ? course.types.join(', ') : '';
        } catch (error) {
            showCourseMessage(`Error loading course for edit: ${error.message}`, 'error');
        }
    };

    window.deleteCourse = async (id) => {
        if (!confirm('Are you sure you want to delete this course? This will also remove its associated types, enrollments, assessments, etc.')) {
            return;
        }
        try {
            await callApi(`/courses/${id}`, 'DELETE');
            showCourseMessage('Course deleted successfully!');
            await fetchCourses(); // Refresh list
        } catch (error) {
            showCourseMessage(`Error deleting course: ${error.message}`, 'error');
        }
    };

    fetchSections(); // Fetch sections when page loads
    fetchCourses(); // Initial fetch on page load
});