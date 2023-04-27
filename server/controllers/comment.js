const Comment = require("../models/Comment.model");

async function addComment(req, res, next) {
  try {
    
    const data = await Posts.create(req.body);

    if (data) return res.json({ msg: "comment added successfully." });
    else return res.json({ msg: "Failed to add comment to the database" });
  } catch (er) {
    next(er);
  }
}

async function getAllComment(req, res) {
  try {
    const comments = await Comment.find();

    res.json(comments);
  } catch (er) {
    console.log(er);
    console.log("get isteği hatası:", er);
  }
}

async function deleteCommentById(req, res, next) {
  try {
    const commentId = req.params.id;

    const comment = await Comment.find({ _id: commentId });

    res.json(comment);
  } catch (er) {
    console.log(er);
    console.log("get isteği hatası:", er);
    next(er);
  }
}

module.exports = {
  getAllComment,
  deleteCommentById,
  addComment
};
