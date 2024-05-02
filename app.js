const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
const session = require('express-session');
const expressEjsLayouts = require("express-ejs-layouts");
const { checkAuth } = require("./middleware/mainware");
const updateDailyStreak = require("./middleware/updateDailyStreak");

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

const app = express();
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs').__express);
app.set('views', path.join(__dirname, 'views'));


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
});

renderPage('/stats', 'stats', {
    title: 'Stats',
});

renderPage('/contactus', 'contatus', {
    title: 'Contact Us',
});

// renderPage('/leaderboard', 'leadbrd', {
//     title: 'Leaderboard',
// });

renderPage('/editdata', 'editdata', {
    title: 'Edit data',
});




app.use("/", authRoutes); 
app.use("/", organiserRoutes);
app.use("/", userRoutes);
app.use("/", realmRoutes);
app.use("/", problemRoutes);
app.use("/" , contestRoutes);
app.use('/', leaderboardRouter);
app.use('/badges', badgesRoutes);

app.use(updateDailyStreak);


app.use(expressEjsLayouts);
app.set('layout', './layouts/mainLayout');


app.get('/profile', (req, res) => {
    res.render('profile', { title: 'Home' });
});

app.get('/logout', (req, res) => {
    // Clear all cookies
    res.clearCookie('userjwt');
    res.clearCookie('superjwt');
    res.clearCookie('moderatorjwt');

    // Redirect to the home page or any other page you prefer
    res.redirect('/');
});



const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
