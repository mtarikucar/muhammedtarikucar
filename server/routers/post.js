const {addPost,getPost,deletePost,addComment,deleteComment,likePost,unlikePost} = require("../controllers/post")
const {verifyTokenAndAuth} = require("../middlewares/verifyToken")
const router = require("express").Router();

router.get("/",getPost)
router.get("/:id",getPost)
router.post("/",verifyTokenAndAuth,addPost)
router.delete("/:id",verifyTokenAndAuth,deletePost)

router.post('/comment',verifyTokenAndAuth, addComment);
router.delete('/comment/:postId/:commentId',verifyTokenAndAuth, deleteComment);
router.post('/like',verifyTokenAndAuth, likePost);
router.post('/unlike',verifyTokenAndAuth, unlikePost);

module.exports = router