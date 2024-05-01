const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');

const authRoutes = require('./routes/authroutes'); 
const organiserRoutes = require('./routes/organiserRoutes');
const userRoutes = require('./routes/UserRoutes');
const realmRoutes = require('./routes/realmRoutes');
const problemRoutes = require('./routes/problemRoutes');
const contestRoutes = require('./routes/contestRoutes');

const cookieParser = require('cookie-parser');
const db = require('./db/databaseConnection');

const app = express();
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs').__express);
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());


app.use("/", authRoutes); 
app.use("/", organiserRoutes);
app.use("/", userRoutes);
app.use("/", realmRoutes);
app.use("/", problemRoutes);
app.use("/" , contestRoutes);



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
