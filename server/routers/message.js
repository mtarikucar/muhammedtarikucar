const router = require("express").Router();
const Messages = require("../models/Message.model");
const { verifyTokenAndAuth, authenticate } = require("../middlewares/verifyToken");

// Get messages for a room (authenticated users only)
router.get("/:room", authenticate, async (req, res, next) => {
  try {
    const { room } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Messages.find({ room: room })
      .sort({ createdAt: -1 })
      .populate("sender", "name image")
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Messages.countDocuments({ room: room });

    res.json({
      status: 'success',
      data: {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalMessages: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (ex) {
    console.error('Get messages error:', ex);
    next(ex);
  }
});

// Send a message (authenticated users only)
router.post("/", authenticate, async (req, res, next) => {
  try {
    const { room, message } = req.body;

    if (!room || !message || message.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Room and message are required'
      });
    }

    const newMessage = new Messages({
      room,
      message: message.trim(),
      sender: req.user.id
    });

    await newMessage.save();
    await newMessage.populate("sender", "name image");

    res.status(201).json({
      status: 'success',
      message: 'Message sent successfully',
      data: { message: newMessage }
    });
  } catch (ex) {
    console.error('Send message error:', ex);
    next(ex);
  }
});

module.exports = router;
