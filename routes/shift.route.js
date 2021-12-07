const express = require('express');
const shiftController = require('../controllers/shift.controller');
const router = express.Router();
const authenticateToken = require('../middleware/authentication')

router.post('/startShift', authenticateToken, (req, res) => {
    shiftController.startNewShift(req, res);
});

router.put('/endShift',  (req, res) => {
    shiftController.endShift(req, res);
});


module.exports = router;