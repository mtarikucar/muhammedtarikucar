const mongoose = require("mongoose");
const Posts = require("../models/Post.model");

async function addPost(req, res, next) {
  try {
    const { title, content, materials, sound, category, author } = req.body;
    const data = await Posts.create({
      title: title,
      content: content,
      materials: materials,
      sound: sound,
      category: category,
      author: author,
    });

    if (data) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (er) {
    console.log(er);
    next(er);
  }
}

async function getPost(req, res) {
  try {
    const { category, userId } = req.query;

    const {id} = req.params // Destructuring the query parameters from the request
    console.log();
    let whereClause = {}; // Initializing an empty where clause object for the Sequelize query

    // If a category is provided in the query, add it to the where clause
    if (category) {
      whereClause.category = category;
    }

    // If a user ID is provided in the query, add it to the where clause
    if (id) {
      whereClause._id = id;
    }

    if (userId) {
      whereClause.author = userId;
    }

    console.log("get isteiği alındı");
    const posts = await Posts.find(whereClause);
    
    res.json(posts);
  } catch (er) {
    console.log(er);
    console.log("get isteği hatası:", er);
    next(er);
  }
}



async function deletePost(req, res, next) {
  try {
    const postId = req.params.id; // assuming the post ID is passed in as a URL parameter

    const deletedPost = await Posts.findByIdAndDelete(postId);

    if (deletedPost) {
      return res.json({ msg: "Post deleted successfully." });
    } else {
      return res.json({ msg: "Post not found." });
    }
  } catch (er) {
    next(er);
  }
}

async function updatePost(req, res, next) {
  try {
    const postId = req.params.id; // assuming the post ID is passed in as a URL parameter
    const { title, content, materials, sound, category } = req.body;

    const updatedPost = await Posts.findByIdAndUpdate(
      postId,
      {
        title: title,
        content: content,
        materials: materials,
        sound: sound,
        category: category,
      },
      { new: true } // to return the updated post instead of the original one
    );

    if (updatedPost) {
      return res.json({ msg: "Post updated successfully.", post: updatedPost });
    } else {
      return res.json({ msg: "Post not found." });
    }
  } catch (er) {
    next(er);
  }
}

module.exports = { addPost, getPost, updatePost, deletePost };
