const {addEvent,getEvents} = require("../controllers/event")
const {verifyTokenAndAuth} = require("../middlewares/verifyToken")
const router = require("express").Router();

router.get("/",getEvents)
router.post("/",addEvent)


module.exports = router