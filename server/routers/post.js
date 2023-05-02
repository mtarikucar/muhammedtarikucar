const {addPost,getPost,deletePost,updatePost} = require("../controllers/post")
const {verifyTokenAndAuth} = require("../middlewares/verifyToken")
const router = require("express").Router();

router.get("/",getPost)
router.get("/:id",getPost)
router.post("/",verifyTokenAndAuth,addPost)
router.delete("/:id",verifyTokenAndAuth,deletePost)

module.exports = router