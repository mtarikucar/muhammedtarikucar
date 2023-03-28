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
    next(er);
  }
}

async function getPost(req, res) {
  try {
    console.log("get isteiği alındı");
    const posts = await Posts.find();
    
    res.json(posts);
  } catch (er) {
    console.log(er);
    console.log("get isteği hatası:", er);
    next(er);
  }
}

async function getPostByUserId(req, res, next) {
  try {
    const userId = req.params.id;
    
    const posts = await Posts.find({ author: userId });
    console.log(posts);
    
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

module.exports = { addPost, getPost, updatePost, deletePost, getPostByUserId };
