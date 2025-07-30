# Nehemiah Builders Institute Web Application

This project provides a full-stack web application for the Nehemiah Builders Institute, featuring user authentication, student management, cohort management, and course management. The frontend is built with HTML, CSS, and vanilla JavaScript, while the backend uses Node.js with Express and interacts with a PostgreSQL database.

## Table of Contents

- [Nehemiah Builders Institute Web Application](#nehemiah-builders-institute-web-application)
  - [Table of Contents](#table-of-contents)
  - [1. Features](#1-features)
  - [2. Project Structure](#2-project-structure)
  - [3. Setup Instructions](#3-setup-instructions)
    - [Prerequisites](#prerequisites)
    - [Database Setup](#database-setup)
    - [Backend Setup](#backend-setup)
    - [Frontend Setup](#frontend-setup)
  - [4. API Endpoints (Backend)](#4-api-endpoints-backend)
  - [5. Extending the Project](#5-extending-the-project)

## 1. Features

* **User Authentication:** Register and log in users (students, admins, facilitators).
* **Student Management:** Add, view, edit, and delete student records (linked to user accounts).
* **Cohort Management:** CRUD operations for academic cohorts.
* **Course Management:** CRUD operations for courses, including linking to sections and defining course types.
* **Token-based Authentication:** Secure API access using JWT (JSON Web Tokens).
* **PostgreSQL Integration:** Robust data storage.

## 2. Project Structure
nehemiah-builders-institute/
├── backend/                  # Node.js Express API
│   ├── config/               # Database connection
│   ├── controllers/          # Business logic for API endpoints
│   ├── middleware/           # Authentication middleware
│   ├── routes/               # API route definitions
│   ├── utils/                # Helper functions (e.g., JWT)
│   ├── server.js             # Main Express application entry point
│   ├── package.json          # Node.js dependencies
│   └── .env.example          # Environment variables template
├── frontend/                 # HTML, CSS, JavaScript for the user interface
│   ├── css/                  # Stylesheets
│   ├── js/                   # Client-side JavaScript logic
│   ├── index.html            # Public landing page
│   ├── login.html            # User login page
│   ├── register.html         # User registration page
│   ├── dashboard.html        # Protected dashboard page
│   ├── students.html         # Student management page
│   ├── cohorts.html          # Cohort management page
│   └── courses.html          # Course management page
├── database/                 # Database related files
│   └── schema.sql            # PostgreSQL table creation script
└── README.md

## 3. Setup Instructions

### Prerequisites

* Node.js (LTS version recommended) and npm (Node Package Manager)
* PostgreSQL database server
* A tool to execute SQL queries (e.g., `psql` command-line tool, DBeaver, pgAdmin)

### Database Setup

1.  **Create a PostgreSQL Database:**
    Open your PostgreSQL client (e.g., `psql` in your terminal) and create a new database:
    ```sql
    CREATE DATABASE nehemiah_db;
    CREATE USER your_postgres_user WITH PASSWORD 'your_postgres_password';
    GRANT ALL PRIVILEGES ON DATABASE nehemiah_db TO your_postgres_user;
    ```
    *Replace `your_postgres_user` and `your_postgres_password` with your desired credentials.*

2.  **Execute Schema Script:**
    Navigate to the `database` directory:
    ```bash
    cd nehemiah-builders-institute/database
    ```
    Execute the `schema.sql` script against your newly created database.
    Example using `psql`:
    ```bash
    psql -U your_postgres_user -d nehemiah_db -f schema.sql
    ```
    (You will be prompted for your password).

### Backend Setup

1.  **Navigate to Backend Directory:**
    ```bash
    cd nehemiah-builders-institute/backend
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the `backend` directory by copying `.env.example`:
    ```bash
    cp .env.example .env
    ```
    Open `.env` and fill in your PostgreSQL database credentials and a strong JWT secret:
    ```
    PORT=3000
    DB_USER=your_postgres_user
    DB_HOST=localhost
    DB_DATABASE=nehemiah_db
    DB_PASSWORD=your_postgres_password
    DB_PORT=5432
    JWT_SECRET=a_very_long_and_random_string_for_jwt_security
    ```

4.  **Start the Backend Server:**
    ```bash
    npm start
    ```
    The server should start on `http://localhost:3000` (or your specified PORT).

### Frontend Setup

1.  **Navigate to Project Root:**
    ```bash
    cd nehemiah-builders-institute
    ```

2.  **Open Frontend in Browser:**
    The frontend is static HTML, CSS, and JS. You can open `frontend/index.html` directly in your web browser.
    * **Tip for development:** For a better experience and to avoid CORS issues if you're experimenting with different setups, you might want to use a simple local web server (e.g., `http-server` npm package: `npm install -g http-server`, then run `http-server frontend`).

## 4. API Endpoints (Backend)

The backend provides RESTful APIs. All protected routes require a JWT in the `Authorization: Bearer <token>` header.

* **Authentication:**
    * `POST /api/auth/register` - Register a new user (`username`, `password`)
    * `POST /api/auth/login` - Login a user (`username`, `password`)

* **Students (Protected):**
    * `POST /api/students` - Create a new student (and linked user account)
    * `GET /api/students` - Get all students
    * `GET /api/students/:id` - Get a student by ID
    * `PUT /api/students/:id` - Update a student
    * `DELETE /api/students/:id` - Delete a student (and linked user account)

* **Cohorts (Protected):**
    * `POST /api/cohorts` - Create a new cohort
    * `GET /api/cohorts` - Get all cohorts
    * `GET /api/cohorts/:id` - Get a cohort by ID
    * `PUT /api/cohorts/:id` - Update a cohort
    * `DELETE /api/cohorts/:id` - Delete a cohort

* **Courses (Protected):**
    * `POST /api/courses` - Create a new course
    * `GET /api/courses` - Get all courses
    * `GET /api/courses/:id` - Get a course by ID
    * `PUT /api/courses/:id` - Update a course
    * `DELETE /api/courses/:id` - Delete a course

* **Course Sections (Protected - implemented via `commonController`):**
    * `GET /api/coursesections` - Get all course sections
    * `GET /api/coursesections/:id` - Get a course section by ID
    * *You would need to add routes in `backend/routes/index.js` and in a new `backend/routes/courseSectionRoutes.js` file if you want full CRUD for this, using the `commonController`.*

## 5. Extending the Project

This project provides a solid foundation. Here are some ways to extend it:

1.  **Implement Remaining Entities:**
    * Follow the pattern used for Students, Cohorts, and Courses to create controllers and routes for all other 21 entities (Admin, Onboarding, Enrollment, Attendance, AssessmentScores, etc.).
    * Utilize `backend/controllers/commonController.js` for simpler tables to reduce boilerplate.

2.  **Add More Frontend Pages:**
    * Create `html` files and corresponding `js` files for each major entity you want to manage through the UI (e.g., `facilitators.html`, `enrollments.html`).
    * Update `dashboard.html` navigation to include links to new pages.

3.  **Frontend Enhancements:**
    * Implement client-side validation for forms.
    * Add pagination, sorting, and filtering to data tables.
    * Consider using a modern JavaScript framework (React, Vue, Angular) for a more complex and maintainable UI if the project scales significantly.
    * Improve error messages and user feedback.

4.  **Backend Enhancements:**
    * **Robust Validation:** Integrate a validation library (e.g., Joi, Express-validator) for more thorough input validation.
    * **Role-Based Access Control (RBAC):** Implement roles (e.g., 'admin', 'student', 'facilitator') and middleware to restrict access to certain routes based on user roles.
    * **Logging:** Add more comprehensive logging.
    * **Error Handling:** Implement a centralized error handling strategy.
    * **Testing:** Add unit and integration tests for your API.

5.  **Deployment:**
    * Configure your application for production deployment (e.g., Heroku, AWS, DigitalOcean). This would involve setting up environment variables securely, using a process manager like PM2, and possibly containerization with Docker.

This comprehensive setup should give you a strong starting point for the Nehemiah Builders Institute web application!