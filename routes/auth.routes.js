const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/login_admin', authController.login);
router.get('/user', authMiddleware.verifyToken, authController.getUser);

module.exports = router;
