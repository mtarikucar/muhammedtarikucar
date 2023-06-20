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

async function getPost(req, res, next) {
  try {
    const { category, userId } = req.query;

    const { id } = req.params; // Destructuring the query parameters from the request
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
    const posts = await Posts.find(whereClause).populate("author").populate({
      path: "comments",
      populate: ({path:"user",select:"name image"}),
    });
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

// Yorum ekleme
async function addComment(req, res, next) {
  try {
    const { postId, content, user } = req.body;

    // Yeni yorum oluştur
    const newComment = {
      text: content,
      user: user,
      createdAt: new Date(),
    };

    // Post'u güncelle ve yorumu ekle
    const updatedPost = await Posts.findByIdAndUpdate(
      postId,
      { $push: { comments: newComment } },
      { new: true }
    );

    if (updatedPost) {
      return res.json({
        msg: "Comment added successfully.",
        post: updatedPost,
      });
    } else {
      return res.json({ msg: "Failed to add comment to the post." });
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
}

// Yorum silme
async function deleteComment(req, res, next) {
  try {
    const { postId, commentId } = req.params;

    // Post'tan yorumu kaldır
    const updatedPost = await Posts.findByIdAndUpdate(
      postId,
      { $pull: { comments: { _id: commentId } } },
      { new: true }
    );

    if (updatedPost) {
      return res.json({
        msg: "Comment deleted successfully.",
        post: updatedPost,
      });
    } else {
      return res.json({ msg: "Failed to delete comment from the post." });
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
}

// Gönderi beğenme
async function likePost(req, res, next) {
  try {
    const { postId, userId } = req.body;

    // Kullanıcının gönderiyi beğenip beğenmediğini kontrol et
    const post = await Posts.findById(postId);
    if (post.likes.includes(userId)) {
      return res.json({ msg: "User has already liked the post." });
    }

    // Post'u güncelle ve kullanıcının beğenisini ekle
    const updatedPost = await Posts.findByIdAndUpdate(
      postId,
      { $push: { likes: userId } },
      { new: true }
    );

    if (updatedPost) {
      return res.json({ msg: "Post liked successfully.", post: updatedPost });
    } else {
      return res.json({ msg: "Failed to like the post." });
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
}

// Beğenmeyi geri alma
async function unlikePost(req, res, next) {
  try {
    const { postId, userId } = req.body;

    // Kullanıcının gönderiyi beğenip beğenmediğini kontrol et
    const post = await Posts.findById(postId);
    if (!post.likes.includes(userId)) {
      return res.json({ msg: "User has not liked the post." });
    }

    // Post'tan kullanıcının beğenisini kaldır
    const updatedPost = await Posts.findByIdAndUpdate(
      postId,
      { $pull: { likes: userId } },
      { new: true }
    );

    if (updatedPost) {
      return res.json({ msg: "Post unliked successfully.", post: updatedPost });
    } else {
      return res.json({ msg: "Failed to unlike the post." });
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
}

module.exports = {
  addPost,
  getPost,
  deletePost,
  addComment,
  deleteComment,
  likePost,
  unlikePost,
};
