# Bug Tracker App

A comprehensive bug tracking and project management application that helps teams organize, track, and manage software bugs and tasks efficiently.

## Screenshots

![Dashboard](screenshots/dashboard.png)
![Projects List](screenshots/projects.png)
![Task Details](screenshots/task-details.png)
![Login Page](screenshots/login.png)
![Register Page](screenshots/register.png)


## Tech Stack

**Frontend:**
- [Frontend- React]
- [Styling - Tailwind CSS]

**Backend:**
- [Backend - Node.js/Express]
- [Database - PostgreSQL]
- [Authentication - JWT]

**Email Service:**
- [Email Provider - Resend]

## Project Structure

```
bug-tracker/

├── backend/           
│   ├── all files from github
│   └── package.json
├── frontend/        
│   ├── all files from github
│   └── package.json
├── screenshots/       
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- [pgAdmin] installed and running
- Email service account (for password reset)

### Installation

1. **Clone the repository**
   bash
   git clone https://github.com/Rina-kumari/BugTrackerApp
   cd bug-tracker
   

2. **Backend Setup**
   bash
   cd backend
   npm install
   

3. **Frontend Setup**
   bash
   cd frontend
   npm install
   

### Configuration

1. **Backend Environment Variables**
   
   Create a `.env` file in the `backend` directory:

    PORT=5000
    DB_HOST=localhost
    DB_PORT=5432
    DB_NAME=your_database_name
    DB_USER=your_database_user
    DB_PASSWORD=your_database_password
    JWT_SECRET=your_jwt_secret_key
    CLIENT_URL=http://localhost:5173

    ARCJET_ENV=development
    ARCJET_KEY=your_secret_key

    RESEND_API_KEY=your_secret_key
    RESEND_DOMAIN=resend.dev
    APP_NAME=TaskApp


2. **Frontend Environment Variables**
   
   Create a `.env` file in the `frontend` directory:
   
   VITE_API_URL = http://localhost:5000/api-v1
   

### Running the Application

1. **Start Backend Server**
   cd backend
   npm run dev
   
   Backend will run on `http://localhost:5000`

2. **Start Frontend Development Server**

   cd frontend
   npm run dev
   
   Frontend will run on `http://localhost:5173`

## Contact

Project Link: https://github.com/Rina-kumari/BugTrackerApp
