const { login, register } = require('../controllers/auth');

const router = require('express').Router();

const {checkPasswordStrength} = require("../utils/auth")


// POST => /api/auth/register
router.post('/register',checkPasswordStrength, register);

// POST => /api/auth/login
router.post('/login', login);

module.exports = router;
