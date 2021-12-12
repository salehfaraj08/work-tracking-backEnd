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
    userController.logout(req, res);
});
router.get('/token', authenticateToken, (req, res) => {
    userController.getToken(req, res);
});
router.get('/getShifts/:id', authenticateToken, (req, res) => {
    userController.getShifts(req, res);
});
module.exports = router;

