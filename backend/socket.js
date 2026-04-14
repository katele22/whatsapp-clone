//👉 This file sets up the Socket.IO server
//  to handle real-time communication between clients.
//  It manages user connections, message sending, and disconnections.

//👉 Import the Server class from socket
const { Server } = require("socket.io");
const { getDb } = require("./mongo");
//👉 Export a function that takes the HTTP server as an argument
module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  // In-memory store for active users: username -> socket.id
  //Example: { "alice": "socket123", "bob": "socket456" }
  const users = {}; 

  //this event is fired when a client connects to the server
  io.on("connection", (socket) => {
    //socket.id is a unique identifier for each connected client
    console.log("User connected:", socket.id);

    socket.on("login", async (username) => {
      const trimmedUsername = String(username || "").trim();

      if (!trimmedUsername) {
        return;
      }

      const db = await getDb();
      await db.collection("users").updateOne(
        { username: trimmedUsername },
        {
          $set: {
            username: trimmedUsername,
            socketId: socket.id,
            isOnline: true,
            lastSeenAt: new Date(),
          },
        },
        { upsert: true }
      );

      users[trimmedUsername] = socket.id;
      socket.username = trimmedUsername;
      console.log(trimmedUsername, "logged in and saved to MongoDB");
    });

    socket.on("send_message", ({ to, message }) => {
      const targetSocket = users[to];

      if (targetSocket) {
        io.to(targetSocket).emit("receive_message", {
          from: socket.username,
          message,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      if (socket.username) {
        delete users[socket.username];
        getDb()
          .then((db) =>
            db.collection("users").updateOne(
              { username: socket.username },
              {
                $set: {
                  isOnline: false,
                  lastSeenAt: new Date(),
                  socketId: null,
                },
              }
            )
          )
          .catch((error) => {
            console.error("Failed to update user offline state:", error);
          });
      }
    });
  });
};
