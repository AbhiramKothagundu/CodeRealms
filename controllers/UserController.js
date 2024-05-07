const express = require('express');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken library
const nodemailer = require('nodemailer');

const User = require('../models/User');
const Realm = require('../models/realm');
const Contest = require('../models/contest')
const Problem = require('../models/problem');
const Bookmark = require('../models/bookmark');

exports.signup = async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const newUser = new User({ username, password, email });
        await newUser.save();

        console.log("Record Inserted Successfully");
        res.redirect('/home');
    } catch (error) {
        console.error('Error:', error.message);
        if (error.name === 'ValidationError') {
            res.status(400).json({ error: error.message });
        } else if (error.code === 11000) {
            res.status(400).json({ error: 'Email must be unique' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

exports.signin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        console.log("User signed in successfully");
        res.redirect('/home');
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};




exports.realm_search = async (req, res) => {
    try {
        const searchTerm = req.query.q;

        const regex = new RegExp(`^${searchTerm}`, 'i');

        const realms = await Realm.find({ name: { $regex: regex } });

        const dropdownsHTML = [];

        for (const realm of realms) {
            // Array to store contest links HTML
            const contestLinksHTML = [];

            // Retrieve contest data based on contest IDs in the realm
            const contestPromises = realm.arrContests.map(async contestId => {
                // Retrieve contest data based on contest ID
                const contest = await Contest.findById(contestId);
                if (contest) {
                    // Add contest name to contest links HTML
                    contestLinksHTML.push(`<a href="#">${contest.text}</a>`);
                }
            });

            // Wait for all contest promises to resolve
            await Promise.all(contestPromises);

            // Construct dropdown HTML
            const dropdownHTML = `
                <div class="dropdown">
                    <div class="dropdown-btn" style="display:flex; align-items: end; justify-content: space-between; ">
                    ${realm.name} 
                    

                    <button id="${realm.name}" style="33px #303030; --accent: fuchsia; font-weight: bold; letter-spacing: 0.1em; border: none; border-radius: 1.1em; background-color: #212121; cursor: pointer; 
                                                color: white; padding: 1em 2em; transition: box-shadow ease-in-out 0.3s, background-color ease-in-out 0.1s, letter-spacing ease-in-out 0.1s, transform ease-in-out 0.1s;
                                                box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px; " onclick="joinRealm('${realm._id}')">JOIN</button>
                    </div>
                    
                    <div class="dropdown-content">
                        ${contestLinksHTML.join('')}
                    </div>
                </div>
                
            `;

            // Add dropdown HTML to array
            dropdownsHTML.push(dropdownHTML);
        }

        // Render the 'realm_search' template with the searchTerm and dropdownsHTML
        res.render('realm_search', { searchTerm, dropdownsHTML });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


exports.problem_search = async (req, res) => {
    try {
        const searchTerm = req.query.q;
        console.log("Search Term: ", searchTerm);
        const regex = new RegExp(`^${searchTerm}`, 'i');
        console.log("Regex: ", regex);
        // Fetch problems from the database where the title matches the regular expression
        const problems = await Problem.find({ QuestionTitle: { $regex: regex } });

        // Render the 'problem_search' template with the searchTerm and problems
        res.render('problem_search', { searchTerm, problems });
        console.log("Problems: ", problems);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}



exports.join_realm = async (req, res) => {
    try {
        const token = req.cookies.userjwt;

        console.log("Running join realm");
        const { realmId } = req.body;
        if (!token || !realmId) {
            return res.status(400).json({ success: false, message: 'Token and realm ID are required' });
        }

        // Verify the token
        const decoded = jwt.verify(token, 'coderealm_secret_code');
        const { username } = decoded;

        // Find the user based on the username
        const user = await User.findOne({ username });

        const email = user.email;

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Add the realm ID to the user's realmIds array
        user.realmIds.push(realmId);
        // Save the updated user object back to the database
        await user.save();



        //sending Email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'abhiram.k22@iiits.in',
                pass: 'tempPassword' // Enter your Gmail app password here
            }
        });

        const mailOptions = {
            from: 'abhiram.k22@iiits.in',
            to: email, // User's email
            subject: 'You have joined a Realm ' + realmId,
            text: `Hello ${username},\n\nYou have successfully joined a realm.\n\nRealm ID: ${realmId},
                    Thanks for using CodeRealms`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });




        res.status(200).json({ success: true, message: 'User joined the realm successfully' });


    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


function getMonthName(month) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month];
}

function getDate(date) {
    // Ensure that 'date' is a valid Date object
    if (date instanceof Date && !isNaN(date)) {
        return date.getDate(); // Return the day of the month
    } else {
        return ''; // Return an empty string if 'date' is not valid
    }
}


function getMonth(date) {
    // Ensure that 'date' is a valid Date object
    if (date instanceof Date && !isNaN(date)) {
        return getMonthName(date.getMonth()); // Return the name of the month
    } else {
        return ''; // Return an empty string if 'date' is not valid
    }
}

exports.home = async (req, res) => {
    try {
        const token = req.cookies.userjwt;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Wrap jwt.verify in a Promise
        const decodedToken = await new Promise((resolve, reject) => {
            jwt.verify(token, 'coderealm_secret_code', (err, decoded) => {
                if (err) reject(err);
                else resolve(decoded);
            });
        });

        const username = decodedToken.username;

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Retrieve realm IDs from the user's data
        const realmIds = user.realmIds;

        // Retrieve realms data based on realm IDs
        const realms = await Realm.find({ _id: { $in: realmIds } });

        // Array to store dropdown HTML
        const dropdownsHTML = [];

        // Array to store all contest IDs
        const allContestIds = [];

        // Iterate over realms
        for (const realm of realms) {
            // Array to store contest data
            const contests = [];

            // Retrieve contest data based on contest IDs in the realm
            const contestPromises = realm.arrContests.map(async contestId => {
                allContestIds.push(contestId); // Add contest ID to allContestIds array

                // Retrieve contest data based on contest ID
                const contest = await Contest.findById(contestId);
                if (contest && contest.startdate) { // Add null check for startdate
                    // Add contest details to the contests array
                    contests.push({
                        id: contest._id,
                        text: contest.text,
                        startdate: parseInt(getDate(contest.startdate)),
                        enddate: contest.enddate,
                        startmonth: getMonth(contest.startdate)

                    });
                }
            });

            // Wait for all contest promises to resolve
            await Promise.all(contestPromises);

            // Construct dropdown HTML
            const dropdownHTML = `
                <div class="dropdown">
                    <button class="dropdown-btn">${realm.name}</button>
                    <div class="dropdown-content">
                        ${contests.map(contest => `<a href="/contest/${contest.id}">${contest.text}</a>`).join('')}
                    </div>
                </div>
            `;

            // Add dropdown HTML to array
            dropdownsHTML.push(dropdownHTML);
        }

        // Retrieve all contests using the contest IDs
        const arrContests = await Contest.find({ _id: { $in: allContestIds } });

        res.render('home', { username, dropdownsHTML, arrContests });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


exports.postBookmark = async (req, res) => {
    try {
        const { questionText, difficulty } = req.body;
        const token = req.cookies.userjwt;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const decodedToken = await new Promise((resolve, reject) => {
            jwt.verify(token, 'coderealm_secret_code', (err, decoded) => {
                if (err) reject(err);
                else resolve(decoded);
            });
        });

        const username = decodedToken.username;
        const user = await User.findOne({ username: username });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Create a new bookmark document
        const bookmark = new Bookmark({ questionTitle: questionText, difficulty });
        await bookmark.save();

        // Initialize user's bookmarks array if not already initialized
        if (!user.bookmarks) {
            user.bookmarks = [];
        }

        // Push the bookmark's _id into the user's bookmarks array
        user.bookmarkIds.push(bookmark._id);
        await user.save();

        // Respond with a success message
        res.status(201).json({ message: 'Bookmark added successfully' });
    } catch (error) {
        console.error('Error adding bookmark:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteBookmark = async (req, res) => {
    try {
        const { bookmarkId } = req.body;

        // Find the bookmark to delete
        const bookmark = await Bookmark.findById(bookmarkId);
        if (!bookmark) {
            return res.status(404).json({ message: 'Bookmark not found' });
        }

        // Remove the reference to the bookmark from the user's bookmarkIds array
        const user = await User.findOneAndUpdate(
            { bookmarkIds: bookmarkId },
            { $pull: { bookmarkIds: bookmarkId } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found or bookmark reference not present' });
        }

        // Delete the bookmark
        await bookmark.remove();

        res.status(200).json({ message: 'Bookmark removed successfully' });
    } catch (error) {
        console.error('Error removing bookmark', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.getBookmark = async (req, res) => {
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
                    difficulty: bookmark.difficulty,
                });
            }
        }

        // Render the EJS file with the bookmark data
        res.redirect('/questionbank', { bookmarks: bookmarkData }); // Pass bookmarks data to the template
    } catch (error) {
        console.error('Error fetching bookmarks:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// Controller function to fetch weekdata of all users
exports.getAllWeekData = async (req, res) => {
    try {
        const users = await User.find({}, { username: 1, weekdata: 1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Controller function to fetch monthdata of all users
exports.getAllMonthData = async (req, res) => {
    try {
        const users = await User.find({}, { username: 1, monthdata: 1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getContestMonthData = async (req, res) => {
    try {
        const users = await User.find({}, { username: 1, monthdata: 1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


