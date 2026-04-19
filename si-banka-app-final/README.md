# Si-Banka Application

This project is separated into a **Frontend** (React + Vite) and a **Backend** (Laravel).

## Project Structure

- `frontend/`: Contains the React SPA, Vite configuration, and frontend dependencies.
- `backend/`: Contains the Laravel API, database migrations, and backend dependencies.
- `docs/`: Contains documentation and notes regarding server IPs and deployment.

## Getting Started

### Prerequisites

- Node.js & npm (for the frontend)
- PHP & Composer (for the backend)
- MySQL/MariaDB or PostgreSQL (depending on your database configuration)

### Running the Frontend

Navigate to the `frontend` directory:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the port specified in your Vite config).

### Running the Backend

Navigate to the `backend` directory:

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

The backend API will be available at `http://localhost:8000`.

## Notes
- Ensure your frontend `.env` is pointing to the correct API endpoint of your backend.
- Additional documentation is listed inside the `docs/` folder.
