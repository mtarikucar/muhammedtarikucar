const mongoose = require("mongoose");
const Event = require("../models/Event.model");

async function addEvent(req, res, next) {
  try {
    const { title, content } = req.body;
    const data = await Event.create({
      title: title,
      content: content,
     
    });

    if (data) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (er) {
    console.log(er);
    next(er);
  }
}

async function getEvents(req, res, next) {
  try {

    const Events = await Event.find()
    res.json(Events);
  } catch (er) {
    console.log(er);
    console.log("get isteği hatası:", er);
    next(er);
  }
}

module.exports = {
  addEvent,
  getEvents,
};
