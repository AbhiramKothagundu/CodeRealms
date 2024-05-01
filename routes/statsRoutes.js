// routes/statsRoutes.js
const express = require('express');
const router = express.Router();
const StatsController = require('../controllers/StatsController');

// Route to update the number of problems solved by the user
router.post('/updateProblems', StatsController.updateProblems);

// Route to fetch data for the charts
router.get('/chartData', StatsController.getChartData);

// Define routes for stats operations
router.get('/monthly-contest-data',getTotalContestsSolved ,StatsController.getMonthlyContestData);
router.get('/daily-problem-data',getTotalContestsSolved, StatsController.getDailyProblemData);


module.exports = router;
