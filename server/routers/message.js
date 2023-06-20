const router = require("express").Router();
const Messages = require("../models/Message.model")

router.get("/:room", async (req, res, next) => {
  try {
    const { room } = req.params;

    const messages = await Messages.find({ room: room })
      .sort({ updatedAt: 1 })
      .populate("sender", "name");

    console.log("messages");
    res.json(messages);
  } catch (ex) {
    next(ex);
  }
});

module.exports = router;
