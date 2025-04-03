const express = require("express");
const multer = require("multer");
const Post = require("../models/Post");  // FIXED: Changed 'post' to 'Post'
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const Notification = require('../models/Notification');

router.post('/like/:postId', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        if (!post.likes.includes(req.user.id)) {
            post.likes.push(req.user.id);
            await post.save();

            // Create notification
            if (post.user.toString() !== req.user.id) {
                const notification = new Notification({
                    sender: req.user.id,
                    receiver: post.user,
                    type: 'like',
                    post: post._id
                });
                await notification.save();

                // Emit real-time notification
                io.to(post.user.toString()).emit('receiveNotification', notification);
            }
        }

        res.json({ message: 'Post liked' });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Prevent duplicate names
  },
});
const upload = multer({ storage });

// Create a post (text & image)
router.post("/create", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user.id;
    const imagePath = req.file ? `uploads/${req.file.filename}` : "";

    const newPost = new Post({
      user: userId,
      text,
      image: imagePath,
    });

    await newPost.save();
    res.status(201).json({ message: "Post created successfully!", post: newPost });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username profilePicture")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Server error" });
  }
});
// Like & Unlike a Post
router.post("/:postId/like", authMiddleware, async (req, res) => {
    try {
      const post = await Post.findById(req.params.postId);
      if (!post) return res.status(404).json({ error: "Post not found" });
  
      const userId = req.user.id;
      const index = post.likes.indexOf(userId);
      if (index === -1) {
        post.likes.push(userId); // Like
      } else {
        post.likes.splice(index, 1); // Unlike
      }
  
      await post.save();
      res.json({ message: "Like status updated", likes: post.likes.length });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });
  // Add a Comment to a Post
router.post("/:postId/comment", authMiddleware, async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: "Comment text is required" });
  
      const post = await Post.findById(req.params.postId);
      if (!post) return res.status(404).json({ error: "Post not found" });
  
      const newComment = {
        user: req.user.id,
        text,
        createdAt: new Date()
      };
  
      post.comments.push(newComment);
      await post.save();
  
      res.status(201).json({ message: "Comment added", comments: post.comments });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });
  

module.exports = router;
