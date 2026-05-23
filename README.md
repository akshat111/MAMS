# Military Asset Management System (MAMS)

A secure, role-based web application for monitoring and managing military equipment, purchases, base-to-base stock transfers, personnel assignments, and asset expenditures.

## Tech Stack
- **Frontend**: React (Vite), React Router v6, Axios, Local Authentication Context
- **Backend**: Node.js, Express, PostgreSQL (`pg` pool)
- **Security**: JWT-based Authentication, Bcrypt Password Hashing, Role-Based Access Control (RBAC)

---

## 1. Database Schema Setup

Create a PostgreSQL database and execute the following SQL script to set up the tables:

```sql
-- 1. Create Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'LogisticsOfficer', 'BaseCommander')),
    base_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Equipment Table
CREATE TABLE equipment (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    base_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Purchases Table
CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    equipment_id INT REFERENCES equipment(id) ON DELETE CASCADE,
    base_id INT NOT NULL,
    quantity INT NOT NULL,
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Transfers Table
CREATE TABLE transfers (
    id SERIAL PRIMARY KEY,
    equipment_id INT REFERENCES equipment(id) ON DELETE CASCADE,
    from_base_id INT NOT NULL,
    to_base_id INT NOT NULL,
    quantity INT NOT NULL,
    transfer_date DATE NOT NULL DEFAULT CURRENT_DATE,
    transferred_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create Assignments Table
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    equipment_id INT REFERENCES equipment(id) ON DELETE CASCADE,
    personnel_name VARCHAR(100) NOT NULL,
    base_id INT NOT NULL,
    quantity INT NOT NULL,
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    assigned_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create Expenditures Table
CREATE TABLE expenditures (
    id SERIAL PRIMARY KEY,
    equipment_id INT REFERENCES equipment(id) ON DELETE CASCADE,
    base_id INT NOT NULL,
    quantity INT NOT NULL,
    reason TEXT NOT NULL,
    expended_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Create Logs Table
CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 2. Configuration & Environment Variables

### Backend Configuration
Create a `.env` file inside the `server` directory:

```env
PORT=5000
JWT_SECRET=your_jwt_secret_key_here

DB_USER=postgres
DB_HOST=localhost
DB_NAME=military_asset_db
DB_PASSWORD=your_db_password
DB_PORT=5432
```

### Frontend Configuration
Frontend uses `/api` endpoints prefix routed via `/services/api.js` pointing to the backend host (default: `http://localhost:5000`).

---

## 3. Installation & Run Instructions

To install dependencies and start both components, execute the following:

### Backend Setup
```bash
cd server
npm install
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

The server runs at [http://localhost:5000](http://localhost:5000), and the Vite frontend runs at [http://localhost:5173](http://localhost:5173) (or fallback port).

---

## 4. Role Permission Matrix (RBAC Rules)
- **Admin**: Full access. View dashboard, add/edit/delete equipment, record purchases, perform transfers, assign assets, expend assets, view system logs.
- **LogisticsOfficer**: Access to view/add equipment, record purchases, perform transfers, assign assets, record expenditures. Cannot delete equipment or see system logs.
- **BaseCommander**: Read-only access to equipment, purchases, transfers, assignments, and expenditures *only* related to their assigned base (`base_id`).
