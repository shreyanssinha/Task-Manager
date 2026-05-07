# Team Task Manager

This is a web application I developed to practice building full-stack apps using the MERN stack. It lets teams organize their work by creating projects, adding members, and tracking tasks through different stages. Two types of users exist in the system - admins who manage everything and members who handle their assigned work. Authentication runs on JSON Web Tokens and passwords are hashed before storage.

- Node.js and Express power the backend API
- MongoDB stores all data through Mongoose ODM
- React 18 handles the frontend, bundled with Vite
- Tailwind CSS provides the styling layer
- bcrypt handles password security
- express-validator checks all incoming data
- Dark themed interface with glassmorphism design

## Running Locally

Prerequisites: Node.js v18+ and a MongoDB database (Atlas or local).

### Clone and install

```bash
git clone <your-repo-url>
cd teamtaskmanager
npm run build
```

This installs everything for both the server and client, then compiles the React app.

### Environment setup

```bash
cp .env.example .env
```

Fill in the `.env` file:

```
MONGODB_URI=mongodb+srv://youruser:yourpass@cluster.mongodb.net/teamtaskmanager
JWT_SECRET=pick-something-random-and-long
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=production
```

### Start

```bash
npm start
```

Visit `http://localhost:5000` in your browser.

### Development

```bash
npm install
npm run dev
```

This launches both Vite on port 3000 and Express on port 5000 simultaneously. API calls from the frontend are proxied automatically.

---

## Railway Deployment

### Push to GitHub

```bash
git init && git add . && git commit -m "initial commit"
git remote add origin <your-github-url>
git push -u origin main
```

### Create Railway project

Go to [railway.app](https://railway.app), sign in, and select **New Project → Deploy from GitHub Repo**.

### Add MongoDB

Inside the Railway project, click **+ New → Database → MongoDB** to get a hosted database.

### Set variables

Add these in the Railway dashboard under **Variables**:

| Variable | Value |
|---|---|
| `MONGODB_URI` | Connection string from Railway MongoDB |
| `JWT_SECRET` | Any long random string |
| `JWT_EXPIRES_IN` | `7d` |
| `NODE_ENV` | `production` |

Railway handles `PORT` on its own.

### Deploy

Railway reads `railway.toml`, runs the build, and starts the server. Should be live in a few minutes.

---

## API Reference

Base path: `/api`. Protected routes require `Authorization: Bearer <token>`.

### Authentication

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create account with name, email, password, role |
| POST | `/api/auth/login` | Get JWT with email and password |
| GET | `/api/auth/me` | Verify current session |

### Users

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/users` | Admin | Retrieve all registered users |

### Projects

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/projects` | Authenticated | List visible projects |
| POST | `/api/projects` | Admin | Create project |
| GET | `/api/projects/:id` | Members | Get project details |
| PUT | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Admin | Delete project and tasks |
| POST | `/api/projects/:id/members` | Admin | Add team member |
| DELETE | `/api/projects/:id/members/:userId` | Admin | Remove team member |

### Tasks

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/api/tasks/projects/:id/tasks` | Admin | Create task in project |
| GET | `/api/tasks/projects/:id/tasks` | Members | List project tasks |
| GET | `/api/tasks/my` | Authenticated | Get assigned tasks |
| GET | `/api/tasks/stats` | Authenticated | Dashboard statistics |
| PUT | `/api/tasks/:id` | Admin | Edit task |
| PATCH | `/api/tasks/:id/status` | Assignee/Admin | Change task status |
| DELETE | `/api/tasks/:id` | Admin | Delete task |

### Status values

- `todo` — not started
- `in_progress` — being worked on
- `done` — completed

---

## Project Layout

```
teamtaskmanager/
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── index.css
│   └── vite.config.js
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── validators/
│   └── server.js
├── .env.example
├── railway.toml
└── package.json
```

---

Developed by Shreyans.
