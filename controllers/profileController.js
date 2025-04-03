const User = require("../models/User"); // Keep only one declaration

// SEARCH USERS
const searchUsers = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: "i" } },
                { name: { $regex: query, $options: "i" } }
            ]
        }).select("-password");

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// FOLLOW A USER
const followUser = async (req, res) => {
    try {
        const { userId, targetId } = req.body;

        if (userId === targetId) {
            return res.status(400).json({ message: "You cannot follow yourself!" });
        }

        const user = await User.findById(userId);
        const targetUser = await User.findById(targetId);

        if (!user || !targetUser) {
            return res.status(404).json({ message: "User not found!" });
        }

        if (!user.following.includes(targetId)) {
            user.following.push(targetId);
            targetUser.followers.push(userId);

            await user.save();
            await targetUser.save();
        }

        res.status(200).json({ message: "User followed successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// UNFOLLOW A USER
const unfollowUser = async (req, res) => {
    try {
        const { userId, targetId } = req.body;

        const user = await User.findById(userId);
        const targetUser = await User.findById(targetId);

        if (!user || !targetUser) {
            return res.status(404).json({ message: "User not found!" });
        }

        user.following = user.following.filter(id => id.toString() !== targetId);
        targetUser.followers = targetUser.followers.filter(id => id.toString() !== userId);

        await user.save();
        await targetUser.save();

        res.status(200).json({ message: "User unfollowed successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ✅ Correctly export all functions
module.exports = { searchUsers, followUser, unfollowUser };
