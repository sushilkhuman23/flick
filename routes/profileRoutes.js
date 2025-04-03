const express = require("express");
const { searchUsers } = require("../controllers/profileController");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/**  Search Users */
router.get("/search",  searchUsers);

/**  Get User Profile */
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**  Update Profile */
router.put("/update", authMiddleware, async (req, res) => {
    try {
        const { username, bio } = req.body;

        // Ensure the user is authenticated
        const userId = req.user.id; // Get user ID from token

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Update user details
        user.username = username || user.username;
        user.bio = bio || user.bio;
        await user.save();

        res.status(200).json({ message: "Profile updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});


/**  Upload Profile Picture */
const upload = require("../middleware/upload"); // Import correctly

router.post("/upload", authMiddleware, upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Get user ID from token
        const userId = req.user.id;

        // Update user profile with new image
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePicture: `/uploads/${req.file.filename}` },
            { new: true } // Returns updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "Profile picture updated successfully!",
            profilePicture: updatedUser.profilePicture
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});



/**  Change Password */
router.put("/change-password", authMiddleware, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect old password" });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password changed successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
const { followUser, unfollowUser } = require("../controllers/profileController");
router.post("/follow", followUser);
router.post("/unfollow", unfollowUser);

module.exports = router; 
