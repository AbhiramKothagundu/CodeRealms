const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

//const userSchema = new mongoose.Schema({
//    username: { type: String, unique: true, required: true },
//    password: { type: String, required: true },
//    email: { type: String, unique: true, required: true }
//});

const Bookmark = require('./bookmark');
const Realm = require('./realm');
const Contest = require('./contest');
const Problem = require('./problem');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    address: {
        type: String,
       
    },
    lastLogin: {
        type: Date
    },
    dailyStreak: {
        type: Number,
        default: 0
    },
    phoneNumber: {
        type: String,
        
    },
    instagramLink: {
        type: String,
        
    },
    linkedinLink: {
        type: String,
      
    },
    twitterLink: {
        type: String,
       
    },
    name: {
        type: String,
       
    },
    type: {
        type: String,
       
    },
    college: {
        type: String,
       
    },
    avatarPath: {
        type: String,
        default: '/images/avatars/memo_3.png' // Default avatar path
    },
    aboutme: {
        bio: {
            type: String,
           
        },
        experience: [{
            type: String,
           
        }],
        education: [{
            type: String,
           
        }]
    },
    skills: [{
        title: {
            type: String,
           
        },
        description: {
            type: String,
           
        }
    }],
    realmIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Realm' }],
    arrProblems: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: 'Problem'
        }
    ],
    arrContests: [
        { 
            type: mongoose.Schema.Types.ObjectId, ref: 'Contest' 
        }
    ],

    weekdata: {
        monday: [Number],
        tuesday: [Number],
        wednesday: [Number],
        thursday: [Number],
        friday: [Number],
        saturday: [Number],
        sunday: [Number]
    },
    
   monthdata:{
        january: [Number],
        february: [Number],
        march: [Number],
        april: [Number],
        may: [Number],
        june: [Number],
        july: [Number],
        august: [Number],
        september: [Number],
        october: [Number],
        november: [Number],
        december: [Number]
    },

    contestmonthdata:{
        january: [Number],
        february: [Number],
        march: [Number],
        april: [Number],
        may: [Number],
        june: [Number],
        july: [Number],
        august: [Number],
        september: [Number],
        october: [Number],
        november: [Number],
        december: [Number]
    },
    badges: [{ kind: String, label: String, image: String }],
    role : {
        type : String, enum:['user','moderator','superuser'], default : 'user'
    },
    bookmarkIds: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: 'Bookmark'
        }
    ],
    banned: { type: Boolean, default: false }
});


UserSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('password')) return next();
    try {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;
        next();
    } catch (error) {
        return next(error);
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
