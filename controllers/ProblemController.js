// controllers/ProblemController.js
const Problem = require('../models/problem');
const User = require('../models/User');
const Bookmark = require('../models/bookmark');
const jwt = require('jsonwebtoken');

exports.createProblem = async (req, res) => {
    try {
        const { question, testcase, rating, points } = req.body;
        const newProblem = new Problem({ question, testcase, rating, points });
        const savedProblem = await newProblem.save();
        res.status(201).json(savedProblem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAllProblems = async (req, res) => {
    try {
        const problems = await Problem.find();
        res.status(200).json(problems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getProblemById = async (req, res) => {
    try {
        const { id } = req.params;
        const problem = await Problem.findById(id);
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        res.status(200).json(problem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateProblem = async (req, res) => {
    try {
        const { id } = req.params;
        const { question, testcase, rating, points } = req.body;
        const updatedProblem = await Problem.findByIdAndUpdate(id, { question, testcase, rating, points }, { new: true });
        if (!updatedProblem) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        res.status(200).json(updatedProblem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteProblem = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProblem = await Problem.findByIdAndDelete(id);
        if (!deletedProblem) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        res.status(200).json({ message: 'Problem deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.getRandomQuestion = async (req, res) => {
    try {
        const { difficulty } = req.params;

        // Aggregate query to fetch a random question by difficulty
        const randomQuestion = await Problem.aggregate([
            { $match: { difficulty } },
            { $sample: { size: 1} }
        ]);

        // If a random question is found, send it in the response
        if (randomQuestion.length > 0) {
            res.json(randomQuestion[0]);
        } else {
            console.error(`No ${difficulty} question found`);
            res.status(404).json({ error: `No ${difficulty} question found` });
        }
    } catch (error) {
        console.error("Error fetching random question:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getQuestionId = async (req, res) => {
    try {
        // Extract question title and difficulty from the request body
        const { questionTitle, difficulty } = req.body;

        // Query the database to find the question with matching title and difficulty
        const question = await Problem.findOne({ QuestionTitle : questionTitle, difficulty });

        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }

        // If the question is found, send its ID to the client
        res.json({ questionID: question._id });
    } catch (error) {
        console.error('Error fetching question ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.getProblemsByDifficulty = async (req, res) => {
    try {
        const { difficulty } = req.params;
        const problems = await Problem.find({ difficulty }); // Assuming 'difficulty' is a field in the Problem model
        res.json(problems);
    } catch (error) {
        console.error(`Error fetching ${difficulty} problems:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.renderQuestionBank = async (req, res) => {
    try {
        const token = req.cookies.userjwt;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const decodedToken = jwt.verify(token, 'coderealm_secret_code');
        const username = decodedToken.username;

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const bookmarks = user.bookmarkIds;

        // Create an array to store bookmark data
        const bookmarkData = [];

        // Iterate through each bookmark and fetch its details
        for (const bookmarkId of bookmarks) {
            const bookmark = await Bookmark.findById(bookmarkId);
            if (bookmark) {
                bookmarkData.push({
                    id: bookmark._id,
                    questionTitle: bookmark.questionTitle,
                    difficulty: bookmark.difficulty
                });
            }
        }

        // Fetch a random problem from the database
        const randomProblem = await Problem.aggregate([{ $sample: { size: 1 } }]);
        const problemDetails = randomProblem[0]; 

        // Render the EJS file with the bookmark data and problem details
        res.render('questionBank', {username, bookmarks: bookmarkData, problem: problemDetails });

    } catch (error) {
        console.error('Error fetching bookmarks:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
