// routes/contestRoutes.js
const express = require('express');
const router = express.Router();
const ContestController = require('../controllers/ContestController');



router.get('/contest/:contestId', ContestController.showContestPage);


module.exports = router;
