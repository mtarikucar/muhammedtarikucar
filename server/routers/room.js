const express = require('express');
const router = express.Router();
const { createRoom, addMember, getRooms } = require('../controllers/room');
const {verifyTokenAndAuth} = require("../middlewares/verifyToken")

router.post('/create',verifyTokenAndAuth, createRoom );
router.post('/addMember' ,verifyTokenAndAuth   , addMember);
router.get('/:userId',verifyTokenAndAuth,  getRooms);



module.exports = router;