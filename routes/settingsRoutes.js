const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

// 🚀 Delete Account Route
router.delete("/delete-account", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // Find and delete user
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "Account deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// 🚀 Change Password Route
const bcrypt = require("bcryptjs");
router.put("/change-password", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;

        // ✅ Validate input fields
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Both old and new passwords are required" });
        }

        // ✅ Ensure new password is different from old password
        if (oldPassword === newPassword) {
            return res.status(400).json({ message: "New password cannot be the same as old password" });
        }

        // ✅ Find user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // ✅ Compare old password with stored password hash
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Old password is incorrect" });
        }

        // ✅ Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // ✅ Update user password in database
        user.password = hashedPassword;
        await user.save();

        res.json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Error changing password:", error); // 🔥 Log error in console
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;

        
