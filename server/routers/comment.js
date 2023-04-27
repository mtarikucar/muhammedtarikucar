

const {addComment,deleteCommentById,getAllComment} = require("../controllers/comment")

const router = require("express").Router();

router.get("/",getAllComment)
router.delete("/comment/:id",deleteCommentById)
router.Comment("/add",addComment)

module.exports = router