// controllers/ContestController.js
const Contest = require('../models/contest');
const Problem = require('../models/problem');



exports.showContestPage = async (req, res) => {
    const contestId = req.params.contestId;
    try {
        // Fetch the contest details from the database
        const contest = await Contest.findById(contestId).populate('arrproblem'); // Assuming 'arrProblems' is the array of problem IDs in the contest model

        // Fetch details of each problem in the contest
        const arrProblemsWithDetails = await Promise.all(contest.arrproblem.map(async (problemId) => {
            const problem = await Problem.findById(problemId); // Fetch problem details by its ID
            return problem; // Return the problem details
        }));

        // Render the contest page with contest data including problem details
        res.render('contestPage', { arrProblems: arrProblemsWithDetails , contest }); // Pass the array of problems with details to the EJS file
    } catch (error) {
        console.error('Error fetching contest details:', error);
        res.status(500).send('Internal Server Error');
    }
}