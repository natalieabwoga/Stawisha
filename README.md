# Stawisha

Stawisha is a healthcare platform. This repository contains the backend and frontend services.

## Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed on your machine.
- Git.

## Setup Instructions

We use `docker-compose` to orchestrate the PostgreSQL database, the Fastify backend, and the Next.js frontend.

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd stawisha
```

### 2. Configure Environment Variables
Inside the `backend/` folder, create a `.env` file from the provided example:
```bash
cp backend/.env.example backend/.env
```
Ensure your `.env` contains the required secrets for JWT authentication and database connections.

### 3. Build and Run
Start all the services using Docker Compose from the root directory:
```bash
docker-compose up --build
```

This command will:
1. Start the **PostgreSQL Database** on port `5434`.
2. Build and start the **Node.js/Fastify Backend** on port `3001`. (The backend will automatically initialize the database schemas and seed default users on startup).
3. Build and start the **Next.js Frontend** on port `3000`.

### 4. Access the Application
Once the containers are running, you can access the application in your browser:
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:3001](http://localhost:3001)

### Stopping the Services
To shut down the application, run:
```bash
docker-compose down
```
*(If you want to clear the database volumes, you can run `docker-compose down -v`)*
