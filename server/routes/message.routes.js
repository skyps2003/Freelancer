const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

const Notification = require('../models/Notification');

// @route   POST api/messages
// @desc    Send a message
// @access  Private
router.post('/', auth, async (req, res) => {
    const { receiver, product, content } = req.body;

    try {
        const newMessage = new Message({
            sender: req.user.id,
            receiver,
            product,
            content
        });

        const message = await newMessage.save();

        // Create Notification
        const notification = new Notification({
            recipient: receiver,
            sender: req.user.id,
            type: 'MESSAGE',
            message: `Nuevo mensaje de un usuario sobre tu producto.`,
            relatedId: message._id
        });
        await notification.save();

        res.json(message);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/messages/conversations/list
// @desc    Get list of users with whom the current user has chatted
// @access  Private
router.get('/conversations/list', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        // Find all messages where sender OR receiver is the current user
        const messages = await Message.find({
            $or: [{ sender: userId }, { receiver: userId }]
        }).sort({ createdAt: -1 }).populate('sender', 'name avatar').populate('receiver', 'name avatar').populate('product', 'title image');

        const conversations = [];
        const seenUsers = new Set();

        messages.forEach(msg => {
            const otherUser = msg.sender._id.toString() === userId ? msg.receiver : msg.sender;
            if (!seenUsers.has(otherUser._id.toString())) {
                seenUsers.add(otherUser._id.toString());
                conversations.push({
                    _id: otherUser._id,
                    name: otherUser.name,
                    avatar: otherUser.avatar,
                    lastMessage: msg.content,
                    date: msg.createdAt
                });
            }
        });

        res.json(conversations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/messages/:userId
// @desc    Get conversation with a specific user
// @access  Private
router.get('/:userId', auth, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: req.params.userId },
                { sender: req.params.userId, receiver: req.user.id }
            ]
        }).sort({ createdAt: 1 }).populate('product', 'title image');

        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
