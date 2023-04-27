const router = require("express").Router();
const { getUserById,getAllUser,updateUserById } = require('../controllers/user');
const { verifyTokenAndAuth } = require("../middlewares/verifyToken");

router.get("/",getAllUser)
router.get("/:id",getUserById)
router.put("/:id",verifyTokenAndAuth,updateUserById)


module.exports =router