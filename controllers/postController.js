const Post = require("../models/Post");

const getFeedPosts = async (req, res) => {
    try {
        const { userId } = req.query;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        // Find posts from followed users, sorted by latest first
        const posts = await Post.find({ user: { $in: user.following } })
            .populate("user", "username name profilePicture")
            .sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { getFeedPosts };
