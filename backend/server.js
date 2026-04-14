//👉 This is the entry point for your backend server. 
// It sets up an Express server and integrates Socket.IO 
// for real-time communication.
//👉 Import necessary modules
const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const { getDb } = require("./mongo");
//👉 Create an express app
const app = express();
//👉 Allow cross-origin requests (CORS)
app.use(cors());
// serve frontend files (production build)
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// test route
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working" });
});

app.get("/api/users", async (req, res) => {
  const db = await getDb();
  const users = await db
    .collection("users")
    .find({}, { projection: { _id: 0, username: 1 } })
    .toArray();

  res.json(users.map((user) => user.username));
});

// send message via API (not real-time, just example)
app.post("/api/message", (req, res) => {
  res.json({ status: "Message received (not sent via socket)" });
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

