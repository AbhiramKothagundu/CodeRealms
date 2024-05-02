const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
const session = require('express-session');
const expressEjsLayouts = require("express-ejs-layouts");
const { checkAuth } = require("./middleware/mainware");
const updateDailyStreak = require("./middleware/updateDailyStreak");
const jwt = require("jsonwebtoken");

const User = require('./models/User');

const authRoutes = require('./routes/authroutes');
const organiserRoutes = require('./routes/organiserRoutes');
const userRoutes = require('./routes/UserRoutes');
const realmRoutes = require('./routes/realmRoutes');
const problemRoutes = require('./routes/problemRoutes');
const contestRoutes = require('./routes/contestRoutes');
const badgesRoutes = require("./routes/badgeRoutes");
const leaderboardRouter = require('./routes/leaderboard');



const cookieParser = require('cookie-parser');
const db = require('./db/databaseConnection');
const { getTotalProblemsSolved, getTotalPoints } = require("./helper");
const { PORT } = require("./config");

const app = express();
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs').__express);
app.set('views', path.join(__dirname, 'views'));

app.use(updateDailyStreak);

app.use('/css', express.static(__dirname + '/public/css'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/imgs', express.static(__dirname + '/public/imgs'));
app.use('/videos', express.static(__dirname + '/public/videos'));
app.use(express.static('public'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.use(express.urlencoded({
    extended: true
}));

app.use(session({
    secret: 'Ballaya',
    resave: false,
    saveUninitialized: false
}));


const renderPage = (route, file, props) => {
    app.get(route, checkAuth, async (req, res) => {
        try {

            res.render(file, { ...props, user: req.user });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });
};

renderPage('/profile', 'profile', {
    title: 'Home',
    layout: './views/layouts/mainLayout',
});

app.get('/stats', checkAuth, async (req, res) => {
    try {
        console.log(req.user);
        // Fetch all users from the database
        const user = await User.findById(req.user._id);
        console.log(user);

        res.render('stats', {
            title: "Stats",
            user,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

renderPage('/contactus', 'contactus', {
    title: 'Contact Us',
});

app.get('/leaderboard', checkAuth, async (req, res) => {
    try {
        // Fetch all users from the database
        const users = await User.find();
        res.render('leadbrd', {
            title: "Leaderboard",
            users: users,
            helpers: { getTotalProblemsSolved, getTotalPoints }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

renderPage('/editdata', 'editdata', {
    title: 'Edit data',
});




app.use("/", authRoutes);
app.use("/", organiserRoutes);
app.use("/", userRoutes);
app.use("/", realmRoutes);
app.use("/", problemRoutes);
app.use("/", contestRoutes);
app.use('/', leaderboardRouter);
app.use('/badges', badgesRoutes);



app.use(expressEjsLayouts);
app.set('layout', './layouts/mainLayout');


// app.get('/profile', (req, res) => {
//     res.render('profile', { title: 'Home' });
// });

app.get('/logout', (req, res) => {
    // Clear all cookies
    res.clearCookie('userjwt');
    res.clearCookie('superjwt');
    res.clearCookie('moderatorjwt');

    // Redirect to the home page or any other page you prefer
    res.redirect('/');
});


app.get('/RCET/practice/:questionID', async (req, res) => {
    // Extract the questionID from the request parameters
    const questionID = req.params.questionID;

    const token = req.cookies.userjwt;

    if (!token) {
        return res.status(400).json({ success: false, message: 'Token is required' });
    }

    // Verify the token
    const decoded = jwt.verify(token, 'coderealm_secret_code');
    const { username } = decoded;

    // Concatenate the URL string with the dynamic parameters
    const path = `/RCET/practice/${questionID}/${username}/000`;

    // Redirect the client to the determined path
    res.redirect(path);
});




app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
