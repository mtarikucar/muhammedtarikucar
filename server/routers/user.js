const router = require("express").Router();
const { getUserById, getAllUser, updateUserById } = require('../controllers/user');
const { verifyTokenAndAuth, authenticate } = require("../middlewares/verifyToken");

// Public routes
router.get("/", getAllUser);
router.get("/:id", getUserById);

// Protected routes - users can update their own profiles
router.put("/:id", verifyTokenAndAuth, updateUserById);

module.exports = router;