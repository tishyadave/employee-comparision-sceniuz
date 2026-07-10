# SkillAssess — Employee Skill Assessment Platform

SkillAssess is a production-ready, full-stack employee skill assessment and performance evaluation platform. It enables organizations to conduct structured multi-topic self-assessments, configure randomized multiple-choice tests, and perform gap analysis comparing self-perception with actual testing outcomes.

---

## 🛠️ Tech Stack

### Frontend
- **Core Framework**: React (Vite-powered SPA)
- **Styling**: TailwindCSS & Custom Vanilla CSS components
- **State & API Interaction**: React Hooks, Axios services, and custom Context management
- **Visuals & Charts**: Recharts (for analytics and progress reporting)

### Backend
- **Runtime Environment**: Node.js
- **Server Framework**: Express.js (supporting CORS, Helmet security, rate limiting, and global exception handling)
- **Database ORM**: Prisma Client
- **Database Engine**: PostgreSQL (Neon Serverless PostgreSQL ready)
- **Security & Authentication**: JSON Web Tokens (JWT) & bcryptjs (for cryptographically secure password hashing)

---

## 🚀 Core Features

- **Role-Based Access Control (RBAC)**: Distinct permissions for `SUPER_ADMIN`, `ADMIN` (Team Leads), and `EMPLOYEE` accounts.
- **Hierarchical Views**: 
  - **Super Admins** manage the list of Admins/Team Leads and view analytics for all employees globally.
  - **Admins/Team Leads** manage and view details only for employees mapped to their team.
  - **Employees** perform self-assessments, take assigned multiple-choice tests, and view their individual dashboards.
- **Gap & Analytics Dashboards**: Interactive charts measuring the gap between an employee's perceived skill levels (Self Score) and direct performance (Actual Test Score).
- **Custom Question Bank Manager**: Admin interface to dynamically add, edit, categorize, and delete assessment questions.

---

## 🏁 Getting Started

Follow these instructions to set up the repository locally.

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.x or newer recommended)
- [PostgreSQL](https://www.postgresql.org/) database server (local instance or hosted URL)

### 1. Clone the Repository
```bash
git clone https://github.com/lohith-Aryanxdata/Employee_Skillassess_Production.git
cd Employee_Skillassess_Production
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend/` directory of the project:
```bash
# Navigate to the backend directory
cd backend
touch .env
```
Add the following configuration variables inside your `backend/.env` file:
```env
# Database Connection String (PostgreSQL URL format)
DATABASE_URL="postgresql://username:password@localhost:5432/employee_sceniuz?schema=public"

# JSON Web Token Secret
JWT_SECRET="your-highly-secure-jwt-random-secret-key"
JWT_EXPIRES_IN="7d"

# Client Application URL (CORS configurations)
CLIENT_URL="http://localhost:5173"

# Node Environment
NODE_ENV="development"

# Server Port
PORT=5000
```

*Note: Ensure you configure a similar `.env` configuration file for the `frontend/` directory if you need to override the default API endpoint.*

### 3. Install Dependencies
Install all required modules for the root workspace, frontend, and backend packages:
```bash
# In the root directory of the project
npm install

# Install packages inside backend and frontend directories
npm install --prefix backend
npm install --prefix frontend
```

### 4. Run Migrations & Seed the Database
Synchronize the PostgreSQL schema structure and populate the initial dataset:
```bash
# Run database migrations from the backend directory
cd backend
npx prisma migrate dev --name init

# Seed the database with the core Admin and Employee accounts
npm run db:seed
```

---

## 💻 Available Scripts

Run the following scripts from the root directory of the workspace:

| Script | Command | Description |
| :--- | :--- | :--- |
| **`npm run dev:backend`** | `npm run dev --prefix backend` | Launches Node backend using nodemon watching on port `5000`. |
| **`npm run dev:frontend`** | `npm run dev --prefix frontend` | Launches Vite local dev server running on `http://localhost:5173`. |
| **`npm run seed`** | `npm run db:seed --prefix backend` | Purges existing users and seeds default credentials. |

---

## 🔒 Security & Production Best Practices

- **Sensitive Configurations**: Never commit the `.env` file or hardcoded passwords to git repository logs. Ensure `.env` is listed inside your `.gitignore`.
- **Password Hashing**: Employee passwords are stored securely using `bcryptjs` utilizing salt rounds factor of 10.
- **Request Limiting**: The Express server implements rate limiters (`express-rate-limit`) on public endpoints and stricter caps on `/api/auth/login` to prevent brute-force attacks.
- **HTTPS & Headers**: Use secure middleware like `helmet` to manage HTTP headers, protecting the system against common injection attacks and cross-site scripts.

---

## 📄 Contribution & Disclaimer

This project is a private repository designed for production use-cases. Direct modifications, external contributions, or distribution of this code must be performed following corporate workflow instructions.

For any queries regarding testing protocols or staging deployments, contact the internal platform manager.
