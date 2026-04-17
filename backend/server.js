//👉 This is the entry point for your backend server. 
// It sets up an Express server and integrates Socket.IO 
// for real-time communication.
//👉 Import necessary modules
const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDb } = require("./mongo");
const { authenticateToken, JWT_SECRET } = require("./auth");
//👉 Create an express app
const app = express();
//👉 Allow cross-origin requests (CORS)
app.use(cors());
// Parse JSON request bodies
app.use(express.json());
// serve frontend files (production build)
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// test route
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working" });
});

// POST /api/register — create a new user with a hashed password
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const db = await getDb();
  const existing = await db.collection("users").findOne({ username });
  if (existing) {
    return res.status(409).json({ error: "Username already taken" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.collection("users").insertOne({ username, passwordHash, isOnline: false });
  res.status(201).json({ message: "User created" });
});

// POST /api/login — verify credentials and return a JWT
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const db = await getDb();
  const user = await db.collection("users").findOne({ username });
  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "24h" });
  res.json({ token });
});

// 🔒 Protected: returns only the logged-in user's own record
app.get("/api/users/me", authenticateToken, async (req, res) => {
  const db = await getDb();
  const user = await db
    .collection("users")
    .findOne({ username: req.user.username }, { projection: { _id: 0, passwordHash: 0 } });

  res.json(user);
});


// get all messages involving a user (inbox)
// 🔒 Protected: requires JWT + you can only read your own inbox
app.get("/api/messages/inbox/:username", authenticateToken, async (req, res) => {
  const { username } = req.params;

  // Authorization: logged-in user can only access their own inbox
  if (req.user.username !== username) {
    return res.status(403).json({ error: "Forbidden: you can only read your own inbox" });
  }

  const db = await getDb();
  const messages = await db
    .collection("messages")
    .find(
      { $or: [{ from: username }, { to: username }] },
      { projection: { _id: 0 } }
    )
    .sort({ sentAt: 1 })
    .toArray();

  res.json(messages);
});



const server = http.createServer(app);

//👉 Attach socket: You are injecting the server into socket logic 
require("./socket")(server);

const PORT = 3000;
//👉 Starts your backend
getDb()
  .then(() => {
    server.listen(PORT, () => {
      console.log("Server running on port", PORT);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  });

