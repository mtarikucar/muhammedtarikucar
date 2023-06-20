const express = require('express');
const router = express.Router();
const { createRoom, addMember, getRooms,startDirectMessage } = require('../controllers/room');
const {verifyTokenAndAuth} = require("../middlewares/verifyToken")

router.post('/create',verifyTokenAndAuth, createRoom );
router.post('/addMember' ,verifyTokenAndAuth   , addMember);
router.get('/:userId',verifyTokenAndAuth,  getRooms);
router.post('/createDirectMessage',verifyTokenAndAuth,  startDirectMessage);



module.exports = router;