# TaskFlow — Lightweight Task Board Application

TaskFlow is a full-stack Kanban task management board built with **React 18**, **Node.js/Express**, and **SQLite**. It allows small teams to organize tasks across standard workflow columns (**To Do**, **In Progress**, **Done**).

---

## 🚀 Overview & Key Features

* **Kanban Board Interface**: View columns and tasks in a clean, responsive layout.
* **Task Management (CRUD)**: Create new tasks, edit existing task details, move tasks between columns, and delete tasks.
* **Priority Tracking & Filtering**: Classify tasks by priority level (`Low`, `Medium`, `High`) and filter visible tasks dynamically.
* **Database Integrity**: Relational database persistence with SQLite, enforcing foreign keys (`ON DELETE CASCADE`) and priority value constraints.
* **Backend Validation**: Rejects empty or whitespace-only task titles with `400 Bad Request` prior to database insertion.
* **Automated Integration Tests**: Jest and Supertest suite verifying API endpoints, validation logic, and database queries.

---

## 🛠️ Tech Stack

* **Frontend**: React 18, Vite, CSS (Custom Design System with CSS Variables)
* **Backend**: Node.js, Express.js
* **Database**: SQLite3 via `better-sqlite3` driver
* **Testing**: Jest, Supertest

---

## 📂 Project Structure

```text
TaskFlow/
├── backend/
│   ├── src/
│   │   ├── app.js             # Express application & route handlers
│   │   ├── db.js              # Database connection, prepared SQL queries & DAO
│   │   ├── schema.sql         # DDL table creation scripts & foreign keys
│   │   ├── seed.js            # Initial board, column & task seed data
│   │   └── server.js          # HTTP server listener entry point
│   ├── tests/
│   │   ├── database.test.js   # SQL query layer integration tests
│   │   └── task.test.js       # Express REST API & validation tests
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Board.jsx          # Board grid component
│   │   │   ├── Column.jsx         # Column container component
│   │   │   ├── EditTaskModal.jsx  # Task editing modal dialog
│   │   │   ├── TaskCard.jsx       # Individual task item card
│   │   │   └── TaskForm.jsx       # New task creation form component
│   │   ├── api.js             # Fetch API wrapper
│   │   ├── App.jsx            # Stateful main application
│   │   ├── main.jsx           # React DOM entry point
│   │   └── index.css          # Design system & CSS theme variables
│   ├── index.html
│   ├── vite.config.js         # Vite bundler & API proxy configuration
│   └── package.json
│
└── README.md
```

---

## 🗄️ Database Schema & SQL Queries

### Relational Tables
1. **`boards`**: `id` (PK), `name`
2. **`columns`**: `id` (PK), `board_id` (FK -> `boards.id`), `name`, `position`
3. **`tasks`**: `id` (PK), `column_id` (FK -> `columns.id`), `title`, `description`, `priority` (`CHECK` constraint), `created_at`

### Mandatory SQL Queries
1. **Task Count Per Column (`LEFT JOIN` & `GROUP BY`)**:
   Calculates total task count for every column on a board, preserving empty columns (`0` tasks).
2. **Tasks by Priority (`WHERE` & `ORDER BY`)**:
   Fetches tasks matching a specific priority level ordered newest first (`created_at DESC`).

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Expected Status |
|---|---|---|---|
| `GET` | `/api/boards/:boardId` | Fetch board with nested columns & tasks | `200 OK` / `404` |
| `POST` | `/api/tasks` | Create a new task | `201 Created` / `400` |
| `PUT` | `/api/tasks/:id` | Update task title, description, priority | `200 OK` / `400` / `404` |
| `DELETE` | `/api/tasks/:id` | Delete a task | `200 OK` / `404` |
| `PATCH` | `/api/tasks/:id/move` | Move a task to a different column | `200 OK` / `400` / `404` |

---

## ⚡ Setup & Installation

### Prerequisites
* **Node.js** (v18.0.0 or higher) & **npm**

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
The backend server will run on `http://localhost:5000`. The SQLite database (`database.sqlite`) will automatically create tables and seed default data on first launch.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The Vite development server will launch on `http://localhost:5173`.

### 3. Running Integration Tests
```bash
cd backend
npm test
```

---

## ⏱️ Development Metadata & Assumptions

* **Approximate Development Time**: ~5 Hours
* **Single Board Scope**: The frontend targets Board ID `1` by default, focusing on core Kanban board functionality without multi-board switching UI overhead.
* **Client-side Filtering**: Priority filtering is performed on the frontend task state to prevent unnecessary network roundtrips during interactive filter changes.
* **Better-SQLite3 synchronous execution**: Simplifies asynchronous flow control and prevents database locking issues while preserving performance.

---

## 🔮 Future Improvements

If given more development time, the following features could be added:
* Drag-and-drop task ordering (`react-beautiful-dnd` or `@hello-pangea/dnd`).
* Search bar for filtering tasks by title/description keywords.
* Subtasks / checklist items within individual task cards.
* Dark/Light mode theme toggle in the header navigation bar.

