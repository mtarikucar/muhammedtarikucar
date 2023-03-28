

const {addPost,getPost,deletePost,updatePost,getPostByUserId} = require("../controllers/post")

const router = require("express").Router();

router.get("/",getPost)
router.get("/user/:id",getPostByUserId)
router.post("/add",addPost)
router.delete("/delete/:id",deletePost)
router.put("/update/:id",updatePost)

module.exports = router