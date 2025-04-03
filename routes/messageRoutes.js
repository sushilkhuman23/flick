const express = require('express');
const Message = require('../models/Message');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Send a new message
router.post('/send', authMiddleware, async (req, res) => {
    try {
        const { receiver, content } = req.body;
        if (!receiver || !content) {
            return res.status(400).json({ error: 'Receiver and content are required' });
        }

        const message = new Message({ sender: req.user.id, receiver, content });
        await message.save();

        res.json({ message: 'Message sent', data: message });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// Get messages between two users
router.get('/:receiverId', authMiddleware, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: req.params.receiverId },
                { sender: req.params.receiverId, receiver: req.user.id }
            ]
        }).sort({ timestamp: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
