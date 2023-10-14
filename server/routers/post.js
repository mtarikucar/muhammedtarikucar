const {addPost,getPost,deletePost,addComment,deleteComment,toggleLike} = require("../controllers/post")
const {verifyTokenAndAuth} = require("../middlewares/verifyToken")
const router = require("express").Router();

router.get("/",getPost)
router.get("/:id",getPost)
router.post("/",addPost)
router.delete("/:id",verifyTokenAndAuth,deletePost)

router.post('/comment', addComment);
router.delete('/comment/:postId/:commentId',verifyTokenAndAuth, deleteComment);
router.post('/like',verifyTokenAndAuth, toggleLike);

module.exports = router