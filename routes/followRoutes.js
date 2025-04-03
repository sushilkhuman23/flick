const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Follow / Unfollow a user
// :id represents the target user's id to follow or unfollow
router.post("/follow/:id", authMiddleware, async (req, res) => {
  try {
    // Find the target user (the one to be followed or unfollowed)
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ error: "User not found" });

    // Find the current authenticated user
    const currentUser = await User.findById(req.user.id);

    // Check if currentUser is already following targetUser
    const isFollowing = currentUser.following.includes(targetUser._id);

    if (isFollowing) {
      // Unfollow: Remove targetUser's id from currentUser.following
      // and remove currentUser's id from targetUser.followers
      currentUser.following.pull(targetUser._id);
      targetUser.followers.pull(currentUser._id);
      await currentUser.save();
      await targetUser.save();

      return res.json({ message: "Unfollowed successfully" });
    } else {
      // Follow: Add targetUser's id to currentUser.following
      // and add currentUser's id to targetUser.followers
      currentUser.following.push(targetUser._id);
      targetUser.followers.push(currentUser._id);
      await currentUser.save();
      await targetUser.save();

      return res.json({ message: "Followed successfully" });
    }
  } catch (error) {
    console.error("Error in follow/unfollow:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
