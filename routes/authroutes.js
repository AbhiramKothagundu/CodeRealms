// UserRoutes.js

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthControllers');
const RealmController = require('../controllers/RealmController');

const Organiser = require('../models/organiser');
const Realm = require('../models/realm');
const Contest = require('../models/contest')
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Problem = require('../models/problem');


router.post("/signup", AuthController.signup);
router.post("/signin", AuthController.signin);

router.get('/realms/:realmName', RealmController.findRealmDetails);

router.delete('/realms/:realmId' , RealmController.deleteRealm);



// Route to render index.ejs
router.get("/", (req, res) => {
    res.render('index');
});

// Route to render login.ejs
router.get("/login", (req, res) => {
    res.render('login', { title: "Login", layout: './layouts/authLayout' });
    
});
// Route to render signin.ejs
router.get("/signin", (req, res) => {
    res.render('signin', { title: "Sign In", layout: './layouts/authLayout' });

});

// Route to render signup.ejs
router.get("/signup", (req, res) => {
    res.render('signup', { title: "Sign Up", layout: './layouts/authLayout' });
    
});



router.get("/superuser_panel", async (req, res) => {

    try {
        // Fetch all users from the database
        const users = await User.find();

        // Fetch all reviews from the database
        const realms = await Realm.find();
        const organisers = await Organiser.find();
        const contests = await Contest.find();
        const problems = await Problem.find();


        const token = req.cookies.superjwt;
        const decodedToken = jwt.verify(token, 'coderealm_secret_code');
        const userRole = decodedToken.role;

        // Check if the user has the superuser role
        if (userRole !== 'superuser') {
            return res.status(403).send("Access Denied");
        }

        // Render the superuser portal page with users and reviews
        res.render("superuser_panel", { users, realms, contests ,problems,organisers });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }

});

router.get("/moderator_panel",async (req, res) => {
    try {
        // Fetch all users from the database
        const users = await User.find();

        // Fetch all reviews from the database
        const realms = await Realm.find();
        const organisers = await Organiser.find();
        const contests = await Contest.find();
        const problems = await Problem.find();


        const token = req.cookies.superjwt;
        const decodedToken = jwt.verify(token, 'coderealm_secret_code');
        const userRole = decodedToken.role;

        // Check if the user has the superuser role
        if (userRole !== 'moderator') {
            return res.status(403).send("Access Denied");
        }

        // Render the superuser portal page with users and reviews
        res.render("moderator_panel", { realms, contests ,problems,organisers , users });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


router.get('/users/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



router.post("/change_role", async (req, res) => {
    try {
        const { userId, role } = req.body;

        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Update user's role
        user.role = role;
        await user.save();

        // Return success response
        res.status(200).json({ message: "User role updated successfully.", user });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "An error occurred while updating user role." });
    }
});


router.put('/organisers/:organiserId/ban', async (req, res) => {
    const { organiserId } = req.params;
    const { banned } = req.body;

    try {
        // Find the organiser by ID and update the banned status
        const updatedOrganiser = await Organiser.findByIdAndUpdate(organiserId, { banned }, { new: true });

        if (!updatedOrganiser) {
            return res.status(404).json({ message: "Organiser not found" });
        }

        res.json(updatedOrganiser);
    } catch (error) {
        console.error("Error updating organiser status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.put('/users/:userId/ban', async (req, res) => {
    const userId = req.params.userId;
    const { banned } = req.body;

    try {
        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update the banned status
        user.banned = banned;
        await user.save();

        res.status(200).json({ message: `User ${banned ? 'banned' : 'unbanned'} successfully` });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});



module.exports = router;
