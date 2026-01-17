# English Student Assignment POC

This is a Proof of Concept (POC) web application for managing English student assignments. It allows teachers to manage students, create assignment templates, and assign tasks to students.

## Architecture

The project is structured as a monorepo with two main components:

- **`frontend/`**: A React application built with Vite using a custom premium CSS design system.
- **`backend/`**: A Node.js + Express REST API handling data persistence (currently in-memory).

## Prerequisites

- Node.js (v18+ recommended)
- npm

## Installation

To install dependencies for both the frontend and backend, run:

```bash
npm run install:all
```

Or manually:

```bash
cd frontend && npm install
cd ../backend && npm install
```

## Running the Application

You need to run both the backend and frontend servers simultaneously (in separate terminal windows).

### 1. Start the Backend

```bash
npm run dev:backend
```
*Server runs on [http://localhost:3000](http://localhost:3000)*

### 2. Start the Frontend

```bash
npm run dev:frontend
```
*Application runs on [http://localhost:5173](http://localhost:5173)*

## Features

- **Student Management**: Add and view students.
- **Assignment Templates**: Create reusable assignments.
- **Dashboard**: Assign tasks to students and track their status (Pending, In Progress, Completed).
