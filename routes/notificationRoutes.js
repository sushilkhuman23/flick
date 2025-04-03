const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

// ✅ POST route to send notifications
router.post("/send", async (req, res) => {
    try {
        const { receiver, message } = req.body;
        if (!receiver || !message) {
            return res.status(400).json({ error: "Receiver and message are required" });
        }

        const notification = new Notification({ receiver, message });
        await notification.save();

        res.json({ message: "Notification sent successfully", data: notification });
    } catch (error) {
        console.error("Error sending notification:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
