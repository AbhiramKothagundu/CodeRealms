// controllers/ContestController.js
const Contest = require('../models/contest');
const Problem = require('../models/problem');

exports.createContest = async (req, res) => {
    try {
        const { arrproblem, text, points, badge } = req.body;
        const newContest = new Contest({ arrproblem, text, points, badge });
        const savedContest = await newContest.save();
        res.status(201).json(savedContest);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getContestById = async (req, res) => {
    try {
        const { id } = req.params;
        const contest = await Contest.findById(id);
        if (!contest) {
            return res.status(404).json({ error: 'Contest not found' });
        }
        res.status(200).json(contest);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateContest = async (req, res) => {
    try {
        const { id } = req.params;
        const { arrproblem, text, points, badge } = req.body;
        const updatedContest = await Contest.findByIdAndUpdate(id, { arrproblem, text, points, badge }, { new: true });
        if (!updatedContest) {
            return res.status(404).json({ error: 'Contest not found' });
        }
        res.status(200).json(updatedContest);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteContest = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedContest = await Contest.findByIdAndDelete(id);
        if (!deletedContest) {
            return res.status(404).json({ error: 'Contest not found' });
        }
        res.status(200).json({ message: 'Contest deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


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