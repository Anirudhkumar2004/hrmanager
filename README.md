# HRGenius

HRGenius is a full-stack Human Resource Management System built with Django REST Framework, React, Vite, Tailwind CSS, and MySQL.

## Phase 1 status

Phase 1 provides the project foundation:

- Django backend and application structure
- Custom Django User model with four roles
- Django REST Framework
- JWT login and refresh endpoints
- CORS configuration
- React/Vite/Tailwind frontend
- MySQL-ready environment configuration
- Backend and frontend communication test

## Phase 2 status

Phase 2 includes:

- JWT login and refresh
- Server-side refresh-token logout
- Custom role claims in access tokens
- Protected React routes
- Login and role-aware dashboard screens
- Inactive-account login rejection
- Four role test accounts

Role test password: `Test@12345`

## Phase 3 status

Phase 3 includes:

- Department create, edit, list, and protected delete
- Employee creation with automatic employee codes
- Employee edit, detail, search, and filtering
- Employee account activation/deactivation behavior
- Role-protected department and employee APIs
- Department and employee React pages

## Phase 4 status

Phase 4 includes:

- Employee check-in and check-out
- Duplicate check-in and check-out prevention
- One attendance record per employee per day
- Working-hour calculation
- Present, Late, and Half Day status rules
- Monthly and daily attendance listing
- Role-aware employee and manager attendance visibility

## Phase 5 status

Phase 5 includes:

- Casual, Sick, and Earned Leave applications
- Automatic leave duration calculation
- Pending, Approved, and Rejected statuses
- Approval and rejection actions
- Rejection comments
- Overlapping approved leave prevention
- Simple annual leave balances

## Phase 6 status

Phase 6 includes:

- Salary configuration by employee
- Effective-date salary history
- Monthly payroll generation
- Gross and net salary calculations
- Duplicate monthly payroll prevention
- Payment status updates
- Historical payroll snapshots
- PDF payslip downloads

## Phase 7 status

Phase 7 includes:

- Role-aware dashboard API summary
- Admin and HR organization metrics
- Department manager team metrics
- Employee personal dashboard metrics
- Employees-by-department chart
- Employee attendance and leave charts
- Real database values in React dashboards

## Phase 8 status

Phase 8 adds final validation and documentation:

- Django unit tests for employee, attendance, leave, and salary modules
- API smoke tests across health, authentication, employees, leaves, payroll, and dashboards
- Anonymous API access protection
- Tailwind CSS entry-point fix
- Responsive login and dashboard shell
- Mobile sidebar navigation
- ERD, DFD, and system flowchart documentation

Run backend tests:

```powershell
cd D:\hrmanager\HRGenius\backend
C:\Users\w10\AppData\Local\Programs\Python\Python311\python.exe manage.py test employees attendance leaves payroll
```

Build the frontend:

```powershell
cd D:\hrmanager\HRGenius\frontend
npm run build
```

## Windows setup

### Backend

```powershell
cd D:\hrmanager\HRGenius\backend
C:\Users\w10\AppData\Local\Programs\Python\Python311\python.exe -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Set `DB_ENGINE=mysql` and fill the `MYSQL_*` values in `.env` to use MySQL.

For XAMPP with MariaDB on port 3307, use:

```text
DB_ENGINE=mysql
MYSQL_DATABASE=hrgenius
MYSQL_USER=hrgenius
MYSQL_PASSWORD=HrGenius@12345
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3307
```

Create the MySQL database and dedicated account:

```sql
CREATE DATABASE hrgenius CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'hrgenius'@'localhost' IDENTIFIED BY 'change-me';
GRANT ALL PRIVILEGES ON hrgenius.* TO 'hrgenius'@'localhost';
FLUSH PRIVILEGES;
```

For local SQLite fallback, set `DB_ENGINE=sqlite`.

### Frontend

```powershell
cd D:\hrmanager\HRGenius\frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open `http://127.0.0.1:5173`.

## API endpoints

- `GET /api/health/`
- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `GET /api/auth/me/`

Demo admin created during initial testing: `admin` / `Admin@12345`. Change this password before real use.
