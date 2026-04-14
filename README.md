# WhatsApp Clone

A real-time chat app built with React, Node.js, Socket.IO, and MongoDB Atlas.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A [MongoDB Atlas](https://cloud.mongodb.com) account with a cluster

---

## Setup

### 1. Clone and install dependencies

```bash
npm run install:all
```

This installs both the backend and frontend dependencies.

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.duzdamk.mongodb.net/whatsapp?appName=Cluster0
MONGODB_DB=whatsapp-clone
```

Replace `<username>` and `<password>` with your Atlas database user credentials.

> The `.env` file is gitignored and never committed. 

### 3. Allow your IP in MongoDB Atlas

1. Go to **Atlas → Network Access**
2. Click **Add IP Address**
3. Add your current IP or use `0.0.0.0/0` for development (allow all)

---

## Running in Development

Open two terminals: At the root folder

**Terminal 1 — Backend**
```bash
npm run dev:backend
```
Runs the Express + Socket.IO server on `http://localhost:3000`

**Terminal 2 — Frontend**
```bash
npm run dev:frontend
```
Runs the React/Vite dev server on `http://localhost:5173`

Open `http://localhost:5173` in your browser.

---

