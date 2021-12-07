const express = require('express');
const userController = require('../controllers/user.controller');
const router = express.Router();
const authenticateToken = require('../middleware/authentication')

router.post('/login', (req, res) => {
    userController.login(req, res);
});
router.post('/addUser', authenticateToken, (req, res) => {
    userController.addNewUser(req, res);
});
router.post('/logout', authenticateToken, (req, res) => {
    userController.logout(req, res)
});
router.put('/addShift', authenticateToken , (req, res) => {
    userController.addNewShift(req, res)
});
module.exports = router;

