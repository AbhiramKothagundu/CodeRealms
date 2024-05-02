const express = require('express');
const router = express.Router();



const { checkAuth } = require("../middleware/mainware");
const nodemailer = require('nodemailer');
const User = require('../models/User');


const UserController = require('../controllers/UserController');

router.get("/home" , UserController.home);
router.get("/realm_search" , UserController.realm_search);
router.get("/problem_search" , UserController.problem_search);
router.post("/join_realm" , UserController.join_realm);

router.get("/bookmark" , UserController.getBookmark);
router.post("/bookmark" , UserController.postBookmark);
router.delete("/bookmark" , UserController.deleteBookmark);


// Define routes for user operati
router.get('/weekdata', UserController.getAllWeekData);

// Route to fetch monthdata of all users
router.get('/monthdata', UserController.getAllMonthData);

router.get('/monthdata', UserController.getContestMonthData);

// For week data
router.get('/users/:userId/weekdata', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId, 'weekdata');
        res.json(user.weekdata);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// For month data
router.get('/users/:userId/monthdata', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId, 'monthdata');
        res.json(user.monthdata);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/users/:userId/contestmonthdata', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId, 'contestmonthdata');
        res.json(user.contestmonthdata);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



router.get('/api/user/weekdata', async (req, res) => {
    try {
      const userId = req.session.userID; // Retrieve userId from session
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user.weekdata); // Send weekdata as response
    } catch (error) {
      console.error('Error fetching week data:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Route to retrieve month data
router.get('/api/user/monthdata', async (req, res) => {
    try {
      const userId = req.session.userID; // Retrieve userId from session
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user.monthdata); // Send monthdata as response
    } catch (error) {
      console.error('Error fetching month data:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/api/user/contestmonthdata', async (req, res) => {
    try {
      const userId = req.session.userID; // Retrieve userId from session
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user.contestmonthdata); // Send monthdata as response
    } catch (error) {
      console.error('Error fetching month data:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });



// Route to handle registration form submission
router.post('/edit-profile', checkAuth, async (req, res) => {
    try {
        // Find the user by their ID
        const user = await User.findById(req.user._id);
        console.log(req.body);
        // Update the user's details with data from the form
        user.address = req.body.address || user.address;
        user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
        user.instagramLink = req.body.instagramLink || user.instagramLink;
        user.linkedinLink = req.body.linkedinLink || user.linkedinLink;
        user.twitterLink = req.body.twitterLink || user.twitterLink;
        user.name = req.body.name || user.name;
        user.type = req.body.type || user.type;
        user.college = req.body.college || user.college;

        user.aboutme.bio = req.body.aboutme.bio || user.aboutme.bio;
        const experience = req.body.aboutme.experience.filter(x => x);
        if (experience.length !== 0) user.aboutme.experience = experience;

        const education = req.body.aboutme.education.filter(x => x);
        if (education.length !== 0) user.aboutme.education = education;

        const skills = req.body.skills.filter(skill => skill.title && skill.description).map(skill => ({ title: skill.title, description: skill.description }));
        if (skills.length !== 0) user.skills = skills;

        console.log(req.body.aboutme);
        // console.log(user);
        
        // Save the updated user details
        await user.save();
        console.log(user.skills);

        res.redirect('/'); // Redirect to a success page or any other page
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.put('/users/:userId/update-avatar', async (req, res) => {
    const userId = req.params.userId;
    const { avatarPath } = req.body;

    try {
        const user = await User.findByIdAndUpdate(userId, { avatarPath }, { new: true });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'Avatar updated successfully' });
    } catch (error) {
        console.error('Error updating avatar:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post('/sendemail', async (req, res) => {
    const { name, email: senderEmail, userId, message } = req.body;

    try {
        // Fetch the user by username
        const user = await User.findById(userId); // Change 'kaushal' to appropriate username
        if (!user) throw new Error('User not found'); // Handle if user not found

        const recipientEmail = user.email; // Get the email of the user

        // Create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'kaushaledara22@gmail.com',
                pass: 'ezol ybtu kcnb wyki'
            }
        });

        // Setup email data with unicode symbols
        let mailOptions = {
            from: 'kaushaledara22@gmail.com',
            to: recipientEmail, // Use the dynamically fetched recipient's email
            subject: 'New Contact Form Submission',
            text: `Name: ${name}\nSender's Email: ${senderEmail}\nMessage: ${message}`
        };

        // Send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error)
                return res.status(500).json({ success: false, message: 'Failed to send email' });
            }
            res.status(200).json({ success: true, message: 'Email sent successfully' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});



module.exports = router;
