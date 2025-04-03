const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const postRoutes = require("./routes/postRoutes");
const followRoutes = require("./routes/followRoutes");
const messageRoutes = require("./routes/messageRoutes"); // ✅ Import message routes
const Message = require("./models/Message"); // ✅ Import Message Model
const notificationRoutes = require("./routes/notificationRoutes"); // ✅ Import notification routes
dotenv.config();
const app = express();


// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // Serve uploaded files

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Routes
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/settings", settingsRoutes);
app.use("/posts", postRoutes);
app.use("/user", followRoutes);
app.use("/api/messages", messageRoutes); // ✅ Add message routes
app.use("/api/notifications",notificationRoutes); // ✅ Add notification routes
// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.io with the HTTP server
const io = socketIo(server, {
  cors: { origin: "*" },
});

// Listen for socket connections
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join a user to their personal room (user ID)
  socket.on("joinRoom", (userId) => {
    socket.join(userId);
    console.log(`User with ID: ${userId} joined room: ${userId}`);
  });

  // Handle sending messages
  socket.on("sendMessage", async (data) => {
    const { sender, receiver, content } = data;
    // Save the message to the database
    const message = new Message({ sender, receiver, content });
    await message.save();
    // Emit message to the receiver
    io.to(receiver).emit("receiveMessage", message);
  });

  socket.on("sendNotification", (data) => {
    console.log("New Notification:", data);
    io.to(data.receiver).emit("receiveNotification", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));