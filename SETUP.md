# Stawisha Platform Setup Guide

Welcome to the Stawisha Platform! This guide will walk you through the process of setting up the project on a new device from scratch.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:
- **Git** (for cloning the repository)
- **Docker** and **Docker Compose** (for running the services and database)
- **Node.js** (v18 or higher recommended, if you plan to run services outside of Docker)

## Step 1: Clone the Repository

First, open your terminal (or Command Prompt/PowerShell) and clone the repository to your local machine:

```bash
git clone https://github.com/natalieabwoga/Stawisha.git
cd Stawisha
```

## Step 2: Environment Configuration

The application requires some environment variables to securely connect the frontend, backend, and database.

1. In the `backend` directory, create a `.env` file:
```bash
# backend/.env
DB_USER=postgres
DB_PASSWORD=secret
DB_HOST=db
DB_PORT=5432
DB_NAME=stawisha
JWT_SECRET=your_super_secret_jwt_key
PORT=3001
```

2. *(Optional)* In the `frontend` directory, create a `.env.local` if you need to override the backend API URL (by default, it uses `http://127.0.0.1:3001` or `http://localhost:3001`).

## Step 3: Build and Run with Docker

This project uses Docker Compose to orchestrate three containers: the Next.js **Frontend**, the Fastify **Backend**, and the PostgreSQL **Database**.

To build and start all the services simultaneously, run:

```bash
docker-compose up --build
```

### What happens when you run this?
1. **Database (`db`)**: A PostgreSQL instance spins up on port `5432`.
2. **Backend (`backend`)**: The Node.js Fastify server builds and starts on port `3001`. It automatically connects to the database and runs the `db-init.js` script to automatically create all required tables (`patients`, `physiotherapists`, `referrals`, `documents`, etc.).
3. **Frontend (`frontend`)**: The Next.js application builds and starts on port `3002`.

*(Note: The first time you run this command, it may take a few minutes to download the Docker images and install NPM dependencies).*

## Step 4: Access the Application

Once the terminal output settles and you see messages indicating the servers are running, open your web browser:

- **Frontend Application**: [http://localhost:3002](http://localhost:3002)
- **Backend API Server**: [http://localhost:3001](http://localhost:3001)

## Troubleshooting

- **Port Conflicts**: If port `3002`, `3001`, or `5432` are already in use on your device, you'll need to stop the conflicting services or map the ports differently in `docker-compose.yml`.
- **Database Connection Errors**: If the backend crashes with a database connection error immediately after spinning up, wait 5 seconds and let Docker restart the backend container. Sometimes the backend boots slightly faster than the PostgreSQL database initialization.
- **Caching Issues**: If the frontend UI doesn't seem to update after pulling new changes, clear the Next.js cache by running:
  ```bash
  docker exec stawisha-frontend-1 sh -c "rm -rf .next/*"
  docker restart stawisha-frontend-1
  ```

## Development Workflow

If you wish to run the servers locally *without* Docker (e.g. for faster hot-reloading in Next.js):
1. Keep only the database running in Docker: `docker-compose up db`
2. Update the backend `.env` file so `DB_HOST=localhost`.
3. In terminal 1 (Backend): `cd backend && npm install && npm run dev`
4. In terminal 2 (Frontend): `cd frontend && npm install && npm run dev`
